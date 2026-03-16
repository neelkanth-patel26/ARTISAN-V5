'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, MapPin, ExternalLink, Eye, UserPlus, UserCheck, QrCode, CreditCard, Palette, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Artist {
  id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  avatar_url?: string
  bio?: string
  website?: string
  upi_id?: string
  upi_qr_code?: string
  followers_count: number
  total_views: number
  created_at: string
}

interface ArtistModalProps {
  artist: Artist | null
  onClose: () => void
}

export function ArtistModal({ artist, onClose }: ArtistModalProps) {
  const router = useRouter()
  const user = getCurrentUser()

  const [isFollowing, setIsFollowing] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'gateway'>('gateway')
  const [artworkCount, setArtworkCount] = useState(0)
  const [artworks, setArtworks] = useState<any[]>([])
  const [portfolioExpanded, setPortfolioExpanded] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  const platformFee = amount ? (parseFloat(amount) * 0.05).toFixed(2) : '0.00'
  const artistReceives = amount ? (parseFloat(amount) - parseFloat(platformFee)).toFixed(2) : '0.00'

  useEffect(() => {
    setViewportHeight(window.innerHeight)
  }, [])

  useEffect(() => {
    if (!artist) return
    if (user) checkFollowStatus()
    incrementView()
    fetchArtworks()
    if (artist.upi_id || artist.upi_qr_code) setPaymentMethod('upi')
  }, [artist?.id])

  const checkFollowStatus = async () => {
    if (!user || !artist) return
    const { data } = await supabase.from('follows').select('id')
      .eq('follower_id', user.user_id).eq('following_id', artist.id).single()
    setIsFollowing(!!data)
  }

  const incrementView = async () => {
    if (!artist) return
    await supabase.from('users').update({ total_views: artist.total_views + 1 }).eq('id', artist.id)
  }

  const fetchArtworks = async () => {
    if (!artist) return
    const { data, count } = await supabase
      .from('artworks').select('*', { count: 'exact' })
      .eq('artist_id', artist.id).eq('status', 'approved')
    setArtworkCount(count || 0)
    setArtworks(data || [])
  }

  const toggleFollow = async () => {
    if (!user) { toast.error('Please login to follow artists'); return }
    if (!artist) return
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.user_id).eq('following_id', artist.id)
      await supabase.from('users').update({ followers_count: artist.followers_count - 1 }).eq('id', artist.id)
      setIsFollowing(false)
      toast.success('Unfollowed')
    } else {
      await supabase.from('follows').insert({ follower_id: user.user_id, following_id: artist.id })
      await supabase.from('users').update({ followers_count: artist.followers_count + 1 }).eq('id', artist.id)
      setIsFollowing(true)
      toast.success('Now following')
    }
  }

  const handleSupport = () => {
    if (!user) { toast.error('Please login to support artists'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }

    if (paymentMethod === 'gateway') {
      router.push(`/checkout?type=support&artistId=${artist?.id}&amount=${amount}`)
    } else {
      if (artist?.upi_qr_code) {
        setShowQR(true)
      } else if (artist?.upi_id) {
        recordUpiTransaction(parseFloat(amount), parseFloat(platformFee))
        window.location.href = `upi://pay?pa=${encodeURIComponent(artist.upi_id)}&pn=${encodeURIComponent(artist.full_name)}&am=${encodeURIComponent(artistReceives)}&cu=INR&tn=Support%20Payment`
        toast.success('Opening UPI app...')
      }
    }
  }

  const recordUpiTransaction = async (total: number, fee: number) => {
    if (!user || !artist) return
    await supabase.from('transactions').insert({
      buyer_id: user.user_id, artist_id: artist.id,
      amount: total, platform_fee: fee, artist_earnings: total - fee,
      transaction_type: 'support', payment_method: 'upi',
      status: 'completed', transaction_code: `UPI-${Date.now()}`
    })
  }

  if (!artist) return null

  const inputCls = 'w-full px-5 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white placeholder:text-neutral-700 focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-[24px] z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      >
        {/* Atmospheric glows */}
        <div className="pointer-events-none absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-600/[0.06] rounded-full blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/[0.04] rounded-full blur-[100px]" />

        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{ maxHeight: viewportHeight ? `${viewportHeight * 0.92}px` : '92dvh' }}
          className="relative bg-neutral-950 border border-white/[0.07] rounded-t-[2.5rem] sm:rounded-[2.5rem] max-w-5xl w-full overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] flex flex-col"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 sm:top-7 sm:right-7 z-50 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-500 hover:text-white hover:border-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex-1 overflow-y-auto scrollbar-hide lg:overflow-hidden lg:flex lg:flex-row min-h-0">

            {/* ── Left Sidebar ── */}
            <div className="lg:w-[320px] xl:w-[360px] shrink-0 bg-white/[0.01] lg:border-r border-b lg:border-b-0 border-white/[0.05] p-6 lg:p-10 lg:overflow-y-auto scrollbar-hide">
              <div className="space-y-8">

                {/* Avatar + Name */}
                <div className="flex flex-row lg:flex-col items-center lg:items-start gap-5 lg:gap-6 pt-2">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-16 sm:h-16 lg:w-36 lg:h-36 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden bg-white/[0.03] border border-white/[0.08]">
                      {artist.avatar_url ? (
                        <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl lg:text-5xl font-light text-neutral-600" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {artist.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-950" />
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <span className="text-[9px] tracking-[0.4em] uppercase font-black text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Artist</span>
                      </div>
                      <Sparkles size={12} className="text-neutral-700" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-light text-white tracking-tight leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {artist.full_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {artist.location && (
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                          <MapPin size={9} className="text-orange-500/40" />
                          {artist.location}
                        </div>
                      )}
                      <span className="text-[9px] text-neutral-700 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                        Est. {new Date(artist.created_at).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-3">
                  {[
                    { icon: Heart, value: artist.followers_count, label: 'Followers', color: 'text-rose-400', glow: 'bg-rose-500/5' },
                    { icon: Eye, value: artist.total_views, label: 'Views', color: 'text-cyan-400', glow: 'bg-cyan-500/5' },
                    { icon: Palette, value: artworkCount, label: 'Works', color: 'text-blue-400', glow: 'bg-blue-500/5' },
                    { icon: TrendingUp, value: Math.floor(artist.total_views / Math.max(artworkCount, 1)), label: 'Avg Views', color: 'text-orange-400', glow: 'bg-orange-500/5' },
                  ].map(({ icon: Icon, value, label, color, glow }) => (
                    <div key={label} className={`relative p-3 lg:p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] group hover:border-orange-500/20 transition-all duration-500 overflow-hidden text-center`}>
                      <div className={`absolute top-0 right-0 w-12 h-12 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${glow}`} />
                      <Icon size={12} className={`${color} mx-auto mb-2 relative z-10`} strokeWidth={1.5} />
                      <p className="text-sm lg:text-xl font-light text-white leading-none relative z-10" style={{ fontFamily: 'ForestSmooth, serif' }}>{value}</p>
                      <p className="text-[7px] lg:text-[8px] tracking-[0.2em] text-neutral-600 uppercase mt-1 font-black relative z-10" style={{ fontFamily: 'Oughter, serif' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {artist.bio && (
                  <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] space-y-2">
                    <p className="text-[9px] text-orange-500/60 uppercase tracking-[0.4em] font-black" style={{ fontFamily: 'Oughter, serif' }}>About</p>
                    <p className="text-[13px] text-neutral-400 leading-relaxed font-light">
                      {artist.bio}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-3">
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-400 text-[9px] tracking-widest uppercase font-black hover:border-white/[0.1] hover:text-white transition-all"
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      <ExternalLink size={12} />
                      Website
                    </a>
                  )}
                  <button
                    onClick={toggleFollow}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] tracking-widest uppercase font-black border transition-all ${
                      isFollowing
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400'
                        : 'bg-white text-black border-white hover:bg-neutral-200'
                    }`}
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    {isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right Main ── */}
            <div className="flex-1 p-6 lg:p-10 xl:p-12 lg:overflow-y-auto scrollbar-hide">
              <div className="max-w-xl mx-auto space-y-10 pb-6">

                {/* Support Card */}
                <div className="rounded-[2rem] bg-white/[0.02] border border-white/[0.05] p-8 space-y-7 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/[0.04] blur-[50px] rounded-full pointer-events-none" />

                  <div className="relative z-10 space-y-1">
                    <p className="text-[9px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Support</p>
                    <h4 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      Back this <span className="text-neutral-500 italic">Artist</span>
                    </h4>
                    <p className="text-[13px] text-neutral-500 font-light">Help them continue their creative journey.</p>
                  </div>

                  <div className="relative z-10 space-y-5">
                    {/* Amount */}
                    <div className="space-y-2">
                      <label className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Amount (₹)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={inputCls + ' text-xl'}
                      />
                    </div>

                    {/* Payment method */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'upi', icon: QrCode, label: 'UPI', disabled: !artist.upi_id && !artist.upi_qr_code },
                        { key: 'gateway', icon: CreditCard, label: 'Card / Net Banking', disabled: false },
                      ].map(({ key, icon: Icon, label, disabled }) => (
                        <button
                          key={key}
                          onClick={() => !disabled && setPaymentMethod(key as 'upi' | 'gateway')}
                          disabled={disabled}
                          className={`flex items-center justify-center gap-2 py-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                            paymentMethod === key
                              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                              : 'bg-white/[0.02] border-white/[0.05] text-neutral-500 hover:border-white/[0.1] hover:text-neutral-300'
                          }`}
                          style={{ fontFamily: 'Oughter, serif' }}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* UPI ID display */}
                    {paymentMethod === 'upi' && artist.upi_id && !showQR && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1"
                      >
                        <p className="text-[8px] text-neutral-600 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>UPI ID</p>
                        <code className="text-orange-400/80 text-sm font-mono break-all">{artist.upi_id}</code>
                      </motion.div>
                    )}

                    {/* QR Code */}
                    {showQR && artist.upi_qr_code && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-2xl bg-white text-center"
                      >
                        <img src={artist.upi_qr_code} alt="UPI QR" className="w-48 h-48 mx-auto" />
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-black mt-3" style={{ fontFamily: 'Oughter, serif' }}>Scan to contribute</p>
                      </motion.div>
                    )}

                    {/* Breakdown */}
                    <AnimatePresence>
                      {amount && parseFloat(amount) > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-5 border-t border-white/[0.05] space-y-3">
                            {[
                              { label: 'Your contribution', value: `₹${parseFloat(amount).toLocaleString()}`, color: 'text-white' },
                              { label: 'Platform fee (5%)', value: `-₹${platformFee}`, color: 'text-rose-400/70' },
                              { label: 'Artist receives', value: `₹${artistReceives}`, color: 'text-emerald-400' },
                            ].map(({ label, value, color }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>{label}</span>
                                <span className={`text-sm font-light ${color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CTA */}
                    <button
                      onClick={handleSupport}
                      className="relative w-full py-5 rounded-[1.5rem] bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-200 transition-all active:scale-[0.98] overflow-hidden group"
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      <span className="relative z-10">
                        {paymentMethod === 'upi'
                          ? (artist.upi_qr_code ? 'Show QR Code' : 'Pay via UPI')
                          : 'Proceed to Payment'}
                      </span>
                      <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                  </div>
                </div>

                {/* Portfolio */}
                {artworkCount > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-end justify-between px-1">
                      <div className="space-y-1">
                        <p className="text-[9px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Portfolio</p>
                        <h4 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          Recent <span className="text-neutral-500">Works</span>
                        </h4>
                      </div>
                      <button
                        onClick={() => setPortfolioExpanded(p => !p)}
                        className="flex items-center gap-2 text-[9px] text-neutral-500 hover:text-orange-400 font-black uppercase tracking-widest transition-colors"
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        {portfolioExpanded ? 'Show less' : `All ${artworkCount}`}
                        <ArrowRight size={11} className={`transition-transform ${portfolioExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(portfolioExpanded ? artworks : artworks.slice(0, 6)).map((artwork, i) => (
                        <motion.div
                          key={artwork.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => router.push(`/gallery?artwork=${artwork.id}`)}
                          className="group aspect-square rounded-[1.5rem] overflow-hidden bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/20 transition-all duration-500 cursor-pointer relative hover:translate-y-[-2px]"
                        >
                          <img
                            src={artwork.image_url}
                            alt={artwork.title}
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[8px] text-white/80 uppercase tracking-widest font-black truncate" style={{ fontFamily: 'Oughter, serif' }}>{artwork.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
