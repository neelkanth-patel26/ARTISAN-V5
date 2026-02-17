'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { CreditCard, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { sendPurchaseEmails, sendSupportEmails } from '@/lib/email/sender'

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

  const isSupport = type === 'support'
  const baseAmount = isSupport ? parseFloat(amount || '0') : (artwork?.price || 0)
  const platformFeeRate = isSupport ? 0.05 : 0.10
  const platformFee = baseAmount * platformFeeRate
  const totalAmount = baseAmount + platformFee
  const artistEarnings = baseAmount

  useEffect(() => {
    async function load() {
      if (isSupport && artistId) {
        const { data } = await supabase.from('users').select('id, full_name, avatar_url').eq('id', artistId).single()
        if (data) setArtist(data)
        setLoading(false)
      } else if (artworkId) {
        const { data, error } = await supabase.rpc('get_all_artworks', { filter_status: 'approved' })
        if (error || !data) {
          setLoading(false)
          return
        }
        const found = (data as any[]).find((a: any) => a.id === artworkId)
        if (found) setArtwork({ id: found.id, title: found.title, artist_name: found.artist_name, image_url: found.image_url, price: Number(found.price), artist_id: found.artist_id })
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
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/) || !expiry.match(/^\d{2}\/\d{2}$/) || !cvc.match(/^\d{3,4}$/) || !name.trim()) {
      toast.error('Please fill card details correctly')
      return
    }
    setPaying(true)
    try {
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
        
        // Send support emails
        if (artist) {
          await sendSupportEmails({
            collectorName: user.full_name || 'Collector',
            collectorEmail: user.email || '',
            artistName: artist.full_name,
            artistEmail: '', // Will be fetched in sender
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
          buyerName: user.full_name || 'Buyer',
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
    <main className="min-h-screen bg-white font-sans">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ArtPay</h1>
                <p className="text-xs text-gray-500 font-normal">Powered by Gaming Network Studio Secure System</p>
              </div>
            </div>
            <Lock className="text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 tracking-wide">ORDER DETAILS</h2>
              {isSupport && artist ? (
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-purple-600">
                        {artist.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Support Artist</h3>
                    <p className="text-sm text-gray-600 font-normal">{artist.full_name}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">₹{baseAmount.toLocaleString()}</p>
                  </div>
                </div>
              ) : artwork ? (
                <div className="flex gap-4">
                  <img src={artwork.image_url || ''} alt="" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{artwork.title}</h3>
                    <p className="text-sm text-gray-600 font-normal">by {artwork.artist_name}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">₹{artwork.price.toLocaleString()}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 tracking-wide">PAYMENT METHOD</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Card number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                    <CreditCard className="absolute right-3 top-3.5 text-gray-400" size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Expiry date</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">CVC</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Cardholder name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock size={18} />}
                  Pay ₹{totalAmount.toLocaleString()}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 tracking-wide">SUMMARY</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-900 font-normal">
                  <span>Subtotal</span>
                  <span>₹{baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-normal">
                  <span>Platform fee ({isSupport ? '5' : '10'}%)</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-3">
                  <Lock className="text-purple-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Secure payment</p>
                    <p className="text-xs text-purple-700 mt-1">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
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
