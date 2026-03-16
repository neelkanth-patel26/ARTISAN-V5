'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { CreditCard, Lock, Loader2, CheckCircle2, QrCode, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    return <CheckoutSkeleton />
  }

  if (!isSupport && !artworkId) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-neutral-400 font-light">Missing transaction details</p>
          <Link href="/gallery" className="inline-block px-8 py-3 rounded-xl bg-amber-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-amber-500 transition-all">Browse gallery</Link>
        </div>
      </main>
    )
  }

  if (!isSupport && !artwork) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-neutral-400 font-light">Artwork not found</p>
          <Link href="/gallery" className="inline-block px-8 py-3 rounded-xl bg-amber-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-amber-500 transition-all">Browse gallery</Link>
        </div>
      </main>
    )
  }

  if (isSupport && !artist) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-neutral-400 font-light">Artist not found</p>
          <Link href="/artist" className="inline-block px-8 py-3 rounded-xl bg-amber-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-amber-500 transition-all">View artists</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-amber-600/30 flex flex-col lg:flex-row">
      
      {/* Left Sidebar - Information (Fixed on Desktop) */}
      <section className="w-full lg:w-[40%] bg-neutral-900/30 lg:h-screen lg:fixed lg:left-0 border-b lg:border-b-0 lg:border-r border-neutral-800/50 flex flex-col p-8 sm:p-12 lg:p-20 overflow-y-auto">
        <div className="flex-1 space-y-12 lg:space-y-20 max-w-sm mx-auto lg:mx-0">
          
          {/* Header & Back */}
          <div className="space-y-8">
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[10px] text-neutral-500 hover:text-white transition-colors uppercase tracking-[0.3em] font-black"
            >
              <div className="h-6 w-6 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-amber-600/50 transition-colors">
                <span className="text-xs">←</span>
              </div>
              Back to Artisan
            </button>
            
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-600 flex items-center justify-center shadow-2xl shadow-amber-900/30">
                <span className="text-white font-bold text-2xl" style={{ fontFamily: 'ForestSmooth, serif' }}>A</span>
              </div>
              <div>
                <h1 className="text-xl font-light text-white tracking-widest uppercase" style={{ fontFamily: 'ForestSmooth, serif' }}>Checkout</h1>
                <p className="text-[9px] text-neutral-500 tracking-[0.2em] font-black uppercase">Secure Institutional Terminal</p>
              </div>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="space-y-4">
            <p className="text-[11px] text-neutral-500 uppercase tracking-[0.4em] font-black">Total Valuation</p>
            <h2 className="text-7xl lg:text-8xl font-medium text-white tracking-tighter">
              ₹{Math.floor(totalAmount).toLocaleString()}
            </h2>
            <div className="flex items-center gap-2 text-neutral-400">
               <span className="text-[10px] font-black tracking-widest uppercase">INR</span>
               <div className="h-1 w-1 rounded-full bg-neutral-700" />
               <span className="text-[10px] font-black tracking-widest uppercase">Secured Transaction</span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="relative group p-6 rounded-[2rem] bg-black/40 border border-neutral-800/50 shadow-2xl overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 blur-[40px] rounded-full pointer-events-none -mr-16 -mt-16" />
             
             <div className="relative z-10 flex gap-6 items-center">
                {isSupport && artist ? (
                  <>
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700/50">
                       {artist.avatar_url ? (
                         <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-2xl text-amber-600/30" style={{ fontFamily: 'ForestSmooth, serif' }}>
                           {artist.full_name.charAt(0).toUpperCase()}
                         </div>
                       )}
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-sm font-bold text-white tracking-wide">{artist.full_name}</h3>
                       <p className="text-neutral-500 text-[10px] tracking-widest uppercase font-black">Support Initiative</p>
                    </div>
                  </>
                ) : artwork ? (
                  <>
                    <div className="h-24 w-24 rounded-2xl overflow-hidden border border-neutral-700/50 shadow-xl">
                      <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-sm font-bold text-white tracking-wide">{artwork.title}</h3>
                       <p className="text-neutral-500 text-[10px] tracking-widest uppercase font-black">by {artwork.artist_name}</p>
                    </div>
                  </>
                ) : null}
             </div>
          </div>

          {/* Price Breakdown Details */}
          <div className="space-y-4 pt-10 border-t border-neutral-800/50">
            <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-black text-neutral-500">
               <span>Base Contribution</span>
               <span className="text-white">₹{baseAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-black text-neutral-500">
               <span>Platform Fee ({isSupport ? '5' : '10'}%)</span>
               <span className="text-white font-medium">₹{platformFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-20 pt-10 border-t border-neutral-800/30 flex items-center gap-4 text-neutral-600">
          <div className="flex items-center gap-2">
            <Lock size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">RSA 4096 Encrypted</span>
          </div>
        </div>
      </section>

      {/* Right Section - Payment Form (Scrollable) */}
      <section className="flex-1 lg:ml-[40%] min-h-screen py-12 px-6 sm:px-12 lg:px-24 flex items-center justify-center">
        <div className="w-full max-w-lg space-y-12">
          
          <div className="space-y-10">
            <h2 className="text-[11px] text-neutral-600 uppercase tracking-[0.5em] font-black text-center">Payment Configuration</h2>

            {/* Segmented Toggle - High Fidelity */}
            <div className="bg-neutral-900/50 p-1.5 rounded-[1.25rem] border border-neutral-800 grid grid-cols-2 gap-1 backdrop-blur-sm shadow-xl">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-3 py-3.5 rounded-xl text-[10px] tracking-[0.2em] font-black uppercase transition-all duration-500 ${
                  paymentMethod === 'card'
                    ? 'bg-neutral-800 text-white shadow-lg border border-neutral-700/50'
                    : 'text-neutral-600 hover:text-neutral-400'
                }`}
              >
                <CreditCard size={14} className={paymentMethod === 'card' ? 'text-amber-600' : 'opacity-30'} />
                Card Gateway
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                disabled={!artistUpiId}
                className={`flex items-center justify-center gap-3 py-3.5 rounded-xl text-[10px] tracking-[0.2em] font-black uppercase transition-all duration-500 ${
                  paymentMethod === 'upi'
                    ? 'bg-neutral-800 text-white shadow-lg border border-neutral-700/50'
                    : !artistUpiId
                    ? 'opacity-20 cursor-not-allowed'
                    : 'text-neutral-600 hover:text-neutral-400'
                }`}
              >
                <QrCode size={14} className={paymentMethod === 'upi' ? 'text-amber-600' : 'opacity-30'} />
                UPI Instant
              </button>
            </div>

            {/* Form Area */}
            <div className="relative group p-8 sm:p-12 rounded-[2.5rem] bg-neutral-900/50 border border-neutral-800 shadow-3xl overflow-hidden backdrop-blur-xl transition-all duration-700 hover:border-neutral-700/50">
              
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' ? (
                  <motion.form 
                    key="card-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit} 
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">Card Identification</label>
                        <div className="relative group/input">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-xl font-medium text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none"
                          />
                          <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-amber-600/50 transition-colors" size={24} />
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
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-xl font-medium text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">CVC Code</label>
                          <input
                            type="text"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-xl font-medium text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">Cardholder Identity</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="FULL NAME AS PER DOCUMENTATION"
                          className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-xs font-black tracking-[0.2em] text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all outline-none uppercase"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full py-6 rounded-[1.5rem] bg-white text-black font-black text-[11px] tracking-[0.4em] uppercase hover:bg-neutral-200 transition-all shadow-3xl active:scale-[0.98] flex items-center justify-center gap-4 group mt-8"
                    >
                      {paying ? <Loader2 className="h-6 w-6 animate-spin" /> : <Lock size={16} />}
                      Confirm Transaction
                    </button>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="upi-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit} 
                    className="space-y-10 text-center"
                  >
                    <div className="space-y-8">
                      <div className="h-24 w-24 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto shadow-2xl">
                        <QrCode size={40} className="text-amber-600/60" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-white tracking-widest uppercase">UPI Identification</h4>
                        <p className="text-[10px] text-neutral-500 tracking-widest uppercase font-black">Authorized Payment Channel</p>
                      </div>
                      
                      <div className="bg-black/60 p-6 rounded-3xl border border-neutral-800/80 backdrop-blur-md shadow-inner">
                        <code className="text-amber-500 font-mono text-xl break-all transition-all hover:scale-105 inline-block">{artistUpiId}</code>
                      </div>
                    </div>
                    
                    <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.3em] leading-loose max-w-xs mx-auto">
                      Initiating this transfer will redirect you to your high-fidelity financial application for final authorization.
                    </p>

                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full py-6 rounded-[1.5rem] bg-amber-600 text-white font-black text-[11px] tracking-[0.4em] uppercase hover:bg-amber-500 transition-all shadow-3xl shadow-amber-900/40 active:scale-[0.98] flex items-center justify-center gap-4 group"
                    >
                      {paying ? <Loader2 className="h-6 w-6 animate-spin" /> : <QrCode size={18} />}
                      Authorize UPI Link
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center space-y-4">
               <p className="text-[9px] text-neutral-700 tracking-[0.3em] uppercase font-black">POWERED BY ARTISAN GLOBAL PLATFORM</p>
               <div className="flex items-center justify-center gap-8 opacity-20 grayscale brightness-200">
                  <div className="h-4 w-12 bg-neutral-600 rounded-sm" />
                  <div className="h-4 w-12 bg-neutral-600 rounded-sm" />
                  <div className="h-4 w-12 bg-neutral-600 rounded-sm" />
               </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}

function CheckoutSkeleton() {
  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col lg:flex-row animate-pulse">
      <section className="w-full lg:w-[40%] bg-neutral-900/30 lg:h-screen p-8 sm:p-12 lg:p-20 border-b lg:border-r border-neutral-800/50 space-y-12">
        <div className="space-y-8">
          <div className="h-4 w-24 bg-neutral-800 rounded-full" />
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-2xl bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-neutral-800 rounded-lg" />
              <div className="h-3 w-40 bg-neutral-800 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
           <div className="h-3 w-32 bg-neutral-800 rounded-lg" />
           <div className="h-20 w-3/4 bg-neutral-800 rounded-2xl" />
        </div>
        <div className="h-32 w-full bg-neutral-800/50 rounded-[2rem]" />
        <div className="space-y-4 pt-10 border-t border-neutral-800/50">
           <div className="h-3 w-full bg-neutral-800 rounded-lg" />
           <div className="h-3 w-full bg-neutral-800 rounded-lg" />
        </div>
      </section>
      <section className="flex-1 lg:ml-[40%] bg-neutral-950 p-8 sm:p-12 lg:p-24 flex items-center justify-center">
         <div className="w-full max-w-lg space-y-12">
            <div className="h-3 w-32 bg-neutral-800 rounded-lg mx-auto" />
            <div className="h-16 w-full bg-neutral-900/50 border border-neutral-800 rounded-[1.25rem]" />
            <div className="h-[400px] w-full bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem]" />
         </div>
      </section>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  )
}
