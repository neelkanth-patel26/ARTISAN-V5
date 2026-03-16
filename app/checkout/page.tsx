'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { CreditCard, Lock, Loader2, CheckCircle2, QrCode, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { sendPurchaseEmails, sendSupportEmails } from '@/lib/email/sender'
import { triggerNotification } from '@/lib/notification-triggers'
import { getImageUrl } from '@/lib/image-utils'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const artworkId = searchParams.get('artwork_id')
  const type = searchParams.get('type')
  const artistId = searchParams.get('artistId')
  const amount = searchParams.get('amount')

  const [artwork, setArtwork] = useState<{ id: string; title: string; artist_name: string; image_url: string; price: number; artist_id: string } | null>(null)
  const [artist, setArtist] = useState<{ id: string; full_name: string; avatar_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card')
  const [artistUpiId, setArtistUpiId] = useState('')
  const [failed, setFailed] = useState(false)

  const isSupport = type === 'support'
  const baseAmount = isSupport ? parseFloat(amount || '0') : (artwork?.price || 0)
  const platformFeeRate = isSupport ? 0.05 : 0.10
  const platformFee = baseAmount * platformFeeRate
  const totalAmount = baseAmount + platformFee
  const artistEarnings = baseAmount

  useEffect(() => {
    async function load() {
      if (isSupport && artistId) {
        const { data } = await supabase.from('users').select('id, full_name, avatar_url, upi_id').eq('id', artistId).single()
        if (data) {
          setArtist(data)
          setArtistUpiId(data.upi_id || '')
        }
        setLoading(false)
      } else if (artworkId) {
        const { data, error } = await supabase.rpc('get_all_artworks', { filter_status: 'approved' })
        if (error || !data) {
          setLoading(false)
          return
        }
        const found = (data as any[]).find((a: any) => a.id === artworkId)
        if (found) {
          setArtwork({ id: found.id, title: found.title, artist_name: found.artist_name, image_url: found.image_url, price: Number(found.price), artist_id: found.artist_id })
          const { data: artistData } = await supabase.from('users').select('upi_id').eq('id', found.artist_id).single()
          if (artistData) setArtistUpiId(artistData.upi_id || '')
        }
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    load()
  }, [artworkId, isSupport, artistId])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user && !loading) router.replace('/login')
  }, [loading, router])

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCurrentUser()
    if (!user?.user_id) return
    
    if (paymentMethod === 'card') {
      if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/) || !expiry.match(/^\d{2}\/\d{2}$/) || !cvc.match(/^\d{3,4}$/) || !name.trim()) {
        toast.error('Please fill card details correctly')
        return
      }
    }
    
    setPaying(true)
    try {
      if (paymentMethod === 'upi') {
        if (!artistUpiId) {
          toast.error('Artist UPI not available')
          setPaying(false)
          return
        }
        
        const artistReceives = baseAmount.toFixed(2)
        const upiUrl = `upi://pay?pa=${artistUpiId}&pn=${encodeURIComponent(isSupport ? artist?.full_name || '' : artwork?.artist_name || '')}&am=${artistReceives}&cu=INR&tn=${encodeURIComponent(isSupport ? 'Support Payment' : 'Artwork Purchase')}`
        
        window.location.href = upiUrl
        toast.success('Opening UPI app...')
        
        // Wait for user to return and confirm payment
        setTimeout(() => {
          setPaying(false)
          const confirmed = window.confirm('Have you completed the UPI payment?')
          if (confirmed) {
            completeUpiTransaction()
          } else {
            toast.error('Payment cancelled')
            setFailed(true)
          }
        }, 3000)
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (isSupport && artistId) {
        const { error } = await supabase.from('transactions').insert({
          transaction_code: 'SUP-' + Date.now(),
          buyer_id: user.user_id,
          artist_id: artistId,
          amount: totalAmount,
          platform_fee: platformFee,
          artist_earnings: artistEarnings,
          payment_method: 'credit_card',
          status: 'completed',
          transaction_type: 'support'
        })
        if (error) throw error
        
        triggerNotification(isSupport ? 'ARTIST_SUPPORT' : 'ARTWORK_PURCHASED')
        
        // Send support emails
        if (artist) {
          await sendSupportEmails({
            collectorName: user.user_name || 'Collector',
            collectorEmail: user.email || '',
            artistName: artist.full_name,
            artistEmail: '',
            artistId: artistId,
            amount: baseAmount,
            platformFee: platformFee,
            artistEarnings: artistEarnings,
            transactionCode: 'SUP-' + Date.now()
          })
        }
      } else if (artwork) {
        const { data: txId, error } = await supabase.rpc('create_transaction', {
          p_buyer_id: user.user_id,
          p_artwork_id: artwork.id,
          p_amount: totalAmount,
          p_payment_method: 'credit_card',
        })
        if (error) throw error
        
        // Send purchase emails
        await sendPurchaseEmails({
          buyerName: user.user_name || 'Buyer',
          buyerEmail: user.email || '',
          artistName: artwork.artist_name,
          artistEmail: '', // Will be fetched in sender
          artistId: artwork.artist_id,
          artworkTitle: artwork.title,
          artworkImage: artwork.image_url,
          price: baseAmount,
          platformFee: platformFee,
          artistEarnings: artistEarnings,
          transactionCode: txId || 'TXN-' + Date.now()
        })
      }
      setSuccess(true)
    } catch (err: any) {
      toast.error(err.message || 'Payment failed')
      setFailed(true)
      setPaying(false)
    }
  }

  const completeUpiTransaction = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return
    
    setPaying(true)
    try {
      if (isSupport && artistId) {
        await supabase.from('transactions').insert({
          transaction_code: 'SUP-' + Date.now(),
          buyer_id: user.user_id,
          artist_id: artistId,
          amount: totalAmount,
          platform_fee: platformFee,
          artist_earnings: artistEarnings,
          payment_method: 'upi',
          status: 'completed',
          transaction_type: 'support'
        })
        
        triggerNotification('ARTIST_SUPPORT')
        
        if (artist) {
          await sendSupportEmails({
            collectorName: user.user_name || 'Collector',
            collectorEmail: user.email || '',
            artistName: artist.full_name,
            artistEmail: '',
            artistId: artistId,
            amount: baseAmount,
            platformFee: platformFee,
            artistEarnings: artistEarnings,
            transactionCode: 'SUP-' + Date.now()
          })
        }
      } else if (artwork) {
        const { data: txId } = await supabase.rpc('create_transaction', {
          p_buyer_id: user.user_id,
          p_artwork_id: artwork.id,
          p_amount: totalAmount,
          p_payment_method: 'upi',
        })
        
        await sendPurchaseEmails({
          buyerName: user.user_name || 'Buyer',
          buyerEmail: user.email || '',
          artistName: artwork.artist_name,
          artistEmail: '',
          artistId: artwork.artist_id,
          artworkTitle: artwork.title,
          artworkImage: artwork.image_url,
          price: baseAmount,
          platformFee: platformFee,
          artistEarnings: artistEarnings,
          transactionCode: txId || 'TXN-' + Date.now()
        })
      }
      
      setSuccess(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to record transaction')
      setFailed(true)
    } finally {
      setPaying(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100"
          >
            <CheckCircle2 className="text-purple-600" size={36} />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
          <p className="text-gray-600 mb-1">{isSupport ? 'Thank you for supporting the artist' : 'Thank you for your purchase'}</p>
          <p className="text-sm text-gray-500 mb-8">
            {isSupport ? `₹${totalAmount.toLocaleString()} sent to ${artist?.full_name}` : `"${artwork?.title}" added to your collection`}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(isSupport ? '/artist' : '/dashboard/collector/purchases')}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
            >
              {isSupport ? 'View artists' : 'View collection'}
            </button>
            <button
              onClick={() => router.push('/gallery')}
              className="w-full py-3 rounded-lg text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Continue browsing
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  if (failed) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
          >
            <X className="text-red-600" size={36} />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment failed</h1>
          <p className="text-gray-600 mb-8">Transaction could not be completed. Please try again.</p>
          <div className="space-y-3">
            <button
              onClick={() => { setFailed(false); setPaying(false) }}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => router.push('/gallery')}
              className="w-full py-3 rounded-lg text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Back to gallery
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </main>
    )
  }

  if (!isSupport && !artworkId) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg text-gray-900 mb-2">Missing artwork</p>
          <Link href="/gallery" className="text-purple-600 hover:text-purple-700 font-medium">Browse gallery</Link>
        </div>
      </main>
    )
  }

  if (!isSupport && !artwork) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg text-gray-900 mb-2">Artwork not found</p>
          <Link href="/gallery" className="text-purple-600 hover:text-purple-700 font-medium">Browse gallery</Link>
        </div>
      </main>
    )
  }

  if (isSupport && !artist) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg text-gray-900 mb-2">Artist not found</p>
          <Link href="/artist" className="text-purple-600 hover:text-purple-700 font-medium">View artists</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-amber-600/30">
      {/* Header */}
      <div className="border-b border-neutral-900 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-2xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform duration-500">
                <span className="text-white font-bold text-xl" style={{ fontFamily: 'ForestSmooth, serif' }}>A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-light text-white tracking-widest uppercase" style={{ fontFamily: 'ForestSmooth, serif' }}>Artisan Checkout</h1>
                <p className="text-[10px] text-neutral-500 tracking-[0.2em] font-black uppercase">Secure Global Payment Engine</p>
              </div>
            </Link>
            <div className="flex items-center gap-4 text-neutral-500">
              <span className="text-[10px] tracking-widest uppercase font-black hidden lg:block">Data Encryption Active</span>
              <Lock className="text-amber-600/60" size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Main Payment Section */}
          <div className="lg:col-span-7 space-y-12">
            {/* Item Preview */}
            <div className="relative group p-8 rounded-[2.5rem] bg-neutral-900 border border-neutral-800 shadow-3xl overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32" />
               
               <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
                  {isSupport && artist ? (
                    <>
                      <div className="h-32 w-32 rounded-[2rem] p-1 bg-black border border-neutral-800 shadow-2xl relative">
                        <div className="w-full h-full rounded-[1.25rem] overflow-hidden bg-neutral-800">
                           {artist.avatar_url ? (
                             <img src={getImageUrl(artist.avatar_url)} alt={artist.full_name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-4xl text-amber-600/30" style={{ fontFamily: 'ForestSmooth, serif' }}>
                               {artist.full_name.charAt(0).toUpperCase()}
                             </div>
                           )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                         <h2 className="text-[10px] text-amber-600 uppercase tracking-[0.3em] font-black">Support Initiative</h2>
                         <h3 className="text-4xl font-light text-white leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>{artist.full_name}</h3>
                         <p className="text-neutral-500 text-sm font-light max-w-md">Your direct contribution helps this artist maintain their creative vision and studio operations.</p>
                      </div>
                    </>
                  ) : artwork ? (
                    <>
                      <div className="h-40 w-40 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl">
                        <img src={getImageUrl(artwork.image_url)} alt={artwork.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-3">
                         <h2 className="text-[10px] text-amber-600 uppercase tracking-[0.3em] font-black">Artwork Acquisition</h2>
                         <h3 className="text-4xl font-light text-white leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>{artwork.title}</h3>
                         <p className="text-neutral-500 text-sm font-light">by <span className="text-neutral-300 font-medium">{artwork.artist_name}</span></p>
                      </div>
                    </>
                  ) : null}
               </div>
            </div>

            {/* Payment Controls */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <h2 className="text-sm text-neutral-400 font-light tracking-widest uppercase">Select Payment Mode</h2>
                 <div className="h-px flex-1 bg-neutral-900" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 transition-all duration-500 group ${
                    paymentMethod === 'card'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-2xl shadow-amber-900/40'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-amber-600/30'
                  }`}
                >
                  <CreditCard size={28} className={paymentMethod === 'card' ? 'scale-110 transition-transform' : 'opacity-30'} />
                  <span className="text-[10px] tracking-[0.3em] uppercase font-black">Secured Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  disabled={!artistUpiId}
                  className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 transition-all duration-500 group ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-2xl shadow-amber-900/40'
                      : !artistUpiId
                      ? 'bg-neutral-900 border-neutral-800/50 text-neutral-800 cursor-not-allowed grayscale'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-amber-600/30'
                  }`}
                >
                  <QrCode size={28} className={paymentMethod === 'upi' ? 'scale-110 transition-transform' : 'opacity-30'} />
                  <span className="text-[10px] tracking-[0.3em] uppercase font-black">UPI Instant</span>
                </button>
              </div>

              {/* Form Content */}
              <div className="bg-neutral-900/50 rounded-[2.5rem] p-8 sm:p-12 border border-neutral-800">
                {paymentMethod === 'upi' ? (
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] text-neutral-600 font-black uppercase tracking-widest">
                        <span>Recipient UPI</span>
                        <span className="text-amber-600/60">Verified</span>
                      </div>
                      <div className="bg-black/40 p-6 rounded-2xl border border-neutral-800">
                        <code className="text-amber-500 font-mono text-lg break-all">{artistUpiId}</code>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-neutral-800">
                       <p className="text-[10px] text-neutral-500 leading-relaxed uppercase tracking-[0.2em] font-bold">
                         Proceeding will open your default UPI application. Please ensure the amount matches exactly.
                       </p>
                    </div>

                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full py-6 rounded-[1.5rem] bg-amber-600 text-white font-black text-sm tracking-[0.3em] uppercase hover:bg-amber-500 transition-all shadow-3xl shadow-amber-900/40 active:scale-[0.98] flex items-center justify-center gap-4 group"
                    >
                      {paying ? <Loader2 className="h-6 w-6 animate-spin" /> : <QrCode size={20} className="group-hover:rotate-12 transition-transform" />}
                      Initialize UPI Transfer
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">Card Identification</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-xl font-light text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none"
                            style={{ fontFamily: 'ForestSmooth, serif' }}
                          />
                          <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-700" size={24} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">Expiration</label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-xl font-light text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none"
                            style={{ fontFamily: 'ForestSmooth, serif' }}
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">CVC Code</label>
                          <input
                            type="text"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-xl font-light text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none"
                            style={{ fontFamily: 'ForestSmooth, serif' }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">Cardholder Entity</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="FULL NAME AS PER CARD"
                          className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none uppercase"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full py-6 rounded-[1.5rem] bg-white text-black font-black text-sm tracking-[0.3em] uppercase hover:bg-neutral-200 transition-all shadow-3xl active:scale-[0.98] flex items-center justify-center gap-4 group mt-4"
                    >
                      {paying ? <Loader2 className="h-6 w-6 animate-spin" /> : <Lock size={20} />}
                      Authorize Payment
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <div className="relative group p-10 rounded-[2.5rem] bg-neutral-900 border border-neutral-800 shadow-3xl overflow-hidden">
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/5 blur-[80px] rounded-full pointer-events-none -ml-24 -mb-24" />
               
               <h2 className="text-sm text-neutral-400 font-light tracking-[0.3em] uppercase mb-10 pb-6 border-b border-neutral-800/50">Fiscal Summary</h2>
               
               <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center group/item">
                    <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold group-hover/item:text-neutral-400 transition-colors">Net Valuation</span>
                    <span className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{baseAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center group/item">
                    <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold group-hover/item:text-neutral-400 transition-colors">Platform Logistics ({isSupport ? '5' : '10'}%)</span>
                    <span className="text-lg font-light text-amber-600/80" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{platformFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-8 mt-8 border-t border-neutral-800/50 flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-600 uppercase tracking-[0.4em] font-black">Total Payable</span>
                      <p className="text-neutral-600 text-[10px] font-medium tracking-widest">INC. ALL APPLICABLE FEES</p>
                    </div>
                    <span className="text-5xl font-light text-white tracking-tighter" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      ₹{Math.floor(totalAmount).toLocaleString()}
                    </span>
                  </div>
               </div>

               <div className="bg-black/40 rounded-3xl p-6 border border-neutral-800/50 flex items-start gap-5">
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                    <Lock className="text-amber-600/60" size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-neutral-300 font-black uppercase tracking-widest mb-1">Encrypted Terminal</h4>
                    <p className="text-[10px] text-neutral-500 font-medium leading-relaxed uppercase tracking-wider">Your fiscal identity is strictly protected by military-grade RSA protocol.</p>
                  </div>
               </div>
            </div>
            
            <div className="text-center">
               <button 
                  onClick={() => router.back()}
                  className="text-[10px] text-neutral-600 uppercase tracking-[0.4em] font-black hover:text-white transition-colors py-4 px-8"
               >
                  ← Terminate Session
               </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-purple-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
