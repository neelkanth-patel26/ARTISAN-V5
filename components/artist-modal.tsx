'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, MapPin, ExternalLink, Eye, UserPlus, UserCheck, QrCode, CreditCard, Image, Share2, Download, Calendar, Award, TrendingUp, Palette } from 'lucide-react'
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
  const [isFollowing, setIsFollowing] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'gateway'>('gateway')
  const platformFeePercent = 5
  const platformFee = amount ? (parseFloat(amount) * platformFeePercent / 100).toFixed(2) : '0.00'
  const artistReceives = amount ? (parseFloat(amount) - parseFloat(platformFee)).toFixed(2) : '0.00'
  const [artworkCount, setArtworkCount] = useState(0)
  const [artworks, setArtworks] = useState<any[]>([])
  const [showArtworks, setShowArtworks] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const [isPortfolioExpanded, setIsPortfolioExpanded] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const router = useRouter()
  const user = getCurrentUser()

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT') {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }
    
    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [])

  useEffect(() => {
    if (artist && user) {
      checkFollowStatus()
      incrementView()
      fetchArtworkCount()
    }
  }, [artist, user])

  useEffect(() => {
    if (artist && (artist.upi_id || artist.upi_qr_code)) {
      setPaymentMethod('upi')
    }
  }, [artist?.id])

  const checkFollowStatus = async () => {
    if (!user || !artist) return
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.user_id)
      .eq('following_id', artist.id)
      .single()
    setIsFollowing(!!data)
  }

  const incrementView = async () => {
    if (!artist) return
    await supabase
      .from('users')
      .update({ total_views: artist.total_views + 1 })
      .eq('id', artist.id)
  }

  const fetchArtworkCount = async () => {
    if (!artist) return
    const { data, count } = await supabase
      .from('artworks')
      .select('*', { count: 'exact' })
      .eq('artist_id', artist.id)
      .eq('status', 'approved')
    setArtworkCount(count || 0)
    setArtworks(data || [])
  }

  const toggleFollow = async () => {
    if (!user) {
      toast.error('Please login to follow artists')
      return
    }
    if (!artist) return

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.user_id)
        .eq('following_id', artist.id)
      
      await supabase
        .from('users')
        .update({ followers_count: artist.followers_count - 1 })
        .eq('id', artist.id)
      
      setIsFollowing(false)
      toast.success('Unfollowed')
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: user.user_id, following_id: artist.id })
      
      await supabase
        .from('users')
        .update({ followers_count: artist.followers_count + 1 })
        .eq('id', artist.id)
      
      setIsFollowing(true)
      toast.success('Following')
    }
  }

  const handleSupport = () => {
    if (!user) {
      toast.error('Please login to support artists')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (paymentMethod === 'gateway') {
      router.push(`/checkout?type=support&artistId=${artist?.id}&amount=${amount}`)
    } else {
      if (artist?.upi_qr_code) {
        setShowSupport(true)
      } else if (artist?.upi_id) {
        const upiIdPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
        if (!upiIdPattern.test(artist.upi_id)) {
          toast.error('Invalid UPI ID')
          return
        }
        const totalAmount = parseFloat(amount)
        const fee = parseFloat(platformFee)
        const upiUrl = `upi://pay?pa=${encodeURIComponent(artist.upi_id)}&pn=${encodeURIComponent(artist.full_name)}&am=${encodeURIComponent(artistReceives)}&cu=INR&tn=Support%20Payment`
        
        // Record transaction in database
        recordUpiTransaction(totalAmount, fee)
        
        window.location.href = upiUrl
        toast.success('Opening UPI app...')
      }
    }
  }

  const recordUpiTransaction = async (totalAmount: number, fee: number) => {
    if (!user || !artist) return
    
    await supabase.from('transactions').insert({
      buyer_id: user.user_id,
      artist_id: artist.id,
      amount: totalAmount,
      platform_fee: fee,
      artist_earnings: totalAmount - fee,
      transaction_type: 'support',
      payment_method: 'upi',
      status: 'completed',
      transaction_code: `UPI-${Date.now()}`
    })
  }

  const handleShare = (artwork: any) => {
    const shareUrl = `${window.location.origin}/gallery?artwork=${artwork.id}`
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `Check out "${artwork.title}" by ${artist?.full_name}`,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    }
  }

  const handleDownload = (artwork: any) => {
    const link = document.createElement('a')
    link.href = artwork.image_url
    link.download = `${artwork.title}.jpg`
    link.click()
  }

  if (!artist) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ height: viewportHeight ? `${viewportHeight * 0.88}px` : '88dvh', maxHeight: '900px' }}
          className="bg-neutral-950 border border-neutral-800 rounded-t-[2rem] sm:rounded-[2.5rem] max-w-6xl w-full overflow-hidden shadow-[0_0_100px_rgba(217,119,6,0.1)] flex flex-col relative"
        >
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-600/5 blur-[100px] rounded-full pointer-events-none -mr-32 -mt-32" />

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 sm:top-8 sm:right-8 text-neutral-500 hover:text-white transition-all p-2.5 sm:p-3 hover:bg-neutral-800/80 rounded-2xl z-50 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Single scroll container on mobile, side-by-side on desktop */}
          <div className="flex-1 overflow-y-auto scrollbar-hide lg:overflow-hidden lg:flex lg:flex-row min-h-0">
            {/* Sidebar — inline on mobile (no scroll), fixed panel on desktop */}
            <div className="lg:w-[340px] xl:w-[380px] bg-neutral-900/30 lg:border-r border-b lg:border-b-0 border-neutral-800/50 p-4 sm:p-6 lg:p-12 lg:overflow-y-auto scrollbar-hide lg:shrink-0">
              <div className="space-y-4 lg:space-y-10">
                <div className="flex flex-row lg:flex-col items-center lg:text-center gap-3 lg:gap-6">
                  {/* Avatar */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative w-14 h-14 sm:w-20 sm:h-20 lg:w-44 lg:h-44 rounded-2xl lg:rounded-3xl p-1 bg-black border border-neutral-800 group shrink-0"
                  >
                    <div className="w-full h-full rounded-xl lg:rounded-[1.25rem] overflow-hidden bg-neutral-800">
                      {artist.avatar_url ? (
                        <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl lg:text-5xl text-amber-600/30 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {artist.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl lg:text-4xl font-light text-white tracking-tight truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {artist.full_name}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {artist.location && (
                        <div className="flex items-center gap-1 text-neutral-400 text-[10px] tracking-widest uppercase font-medium">
                          <MapPin size={9} className="text-amber-600/60 shrink-0" />
                          <span className="truncate">{artist.location}</span>
                        </div>
                      )}
                      <div className="text-[9px] text-neutral-600 tracking-wider uppercase font-bold">
                        Est. {new Date(artist.created_at).getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats — 4-col on mobile, 2-col on lg */}
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 lg:gap-3">
                  {[
                    { icon: Heart, val: artist.followers_count, label: 'Followers' },
                    { icon: Eye, val: artist.total_views, label: 'Views' },
                    { icon: Palette, val: artworkCount, label: 'Works' },
                    { icon: TrendingUp, val: Math.floor(artist.total_views / Math.max(artworkCount, 1)), label: 'Avg' },
                  ].map(({ icon: Icon, val, label }) => (
                    <div key={label} className="bg-black/20 rounded-xl lg:rounded-2xl p-2 lg:p-4 border border-neutral-800/50 hover:border-amber-600/20 transition-colors text-center group">
                      <Icon size={11} className="text-amber-600/50 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs lg:text-lg font-light text-white leading-none">{val}</p>
                      <p className="text-[7px] lg:text-[8px] tracking-[0.15em] text-neutral-600 uppercase mt-1 font-bold">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 lg:space-y-4">
                  <h4 className="flex items-center gap-2 text-[9px] lg:text-[10px] text-amber-600/80 uppercase tracking-[0.3em] font-black">
                    <Award size={11} />
                    About Artist
                  </h4>
                  <div className="relative bg-neutral-900/40 rounded-xl lg:rounded-2xl p-3 lg:p-5 border border-neutral-800/50">
                    <p className="text-neutral-400 text-[11px] lg:text-xs leading-relaxed italic font-light">
                      {artist.bio ? `"${artist.bio}"` : 'This artist prefers to let their work speak for itself.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col gap-2 lg:gap-3">
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 lg:py-3.5 rounded-2xl bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 text-[10px] tracking-widest uppercase font-bold transition-all border border-neutral-800 hover:border-neutral-700"
                    >
                      <ExternalLink size={13} />
                      Website
                    </a>
                  )}
                  <button
                    onClick={toggleFollow}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 lg:py-3.5 rounded-2xl transition-all text-[10px] tracking-[0.2em] uppercase font-black shadow-xl ${
                      isFollowing
                        ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Section */}
            <div className="lg:flex-1 p-4 sm:p-6 lg:p-12 xl:p-16 lg:overflow-y-auto relative scrollbar-hide">
              <div className="max-w-3xl mx-auto space-y-12">
                
                {/* Support Form Design */}
                <div className="relative group overflow-hidden">
                  <div className="absolute -inset-px bg-gradient-to-b from-amber-600/20 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative bg-neutral-900 border border-neutral-800 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-10 shadow-3xl transition-all duration-700 group-hover:translate-y-[-2px] group-hover:border-neutral-800">
                    
                    <div className="space-y-1">
                       <h4 className="text-2xl sm:text-4xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>Support artist</h4>
                       <p className="text-neutral-500 text-xs font-light">Help them continue their creative journey</p>
                    </div>

                    <div className="space-y-8">
                      {/* Amount Input */}
                      <div className="space-y-3">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black ml-1">Amount (₹)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="00.00"
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-[1.25rem] px-5 sm:px-8 py-4 sm:py-5 text-xl sm:text-2xl font-medium text-white placeholder:text-neutral-800 focus:border-amber-600/50 focus:outline-none transition-all focus:bg-black/60 outline-none"
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-neutral-700 font-medium">
                            INR
                          </div>
                        </div>
                      </div>

                      {/* Payment Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setPaymentMethod('upi')}
                          disabled={!artist.upi_id && !artist.upi_qr_code}
                          className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all group/pay ${
                            paymentMethod === 'upi'
                              ? 'bg-amber-600 border-amber-600 text-white shadow-2xl shadow-amber-900/40'
                              : 'bg-black/20 border-neutral-800 text-neutral-500 hover:border-amber-600/30'
                          }`}
                        >
                          <QrCode size={18} className={`${paymentMethod === 'upi' ? 'opacity-100' : 'opacity-40'}`} />
                          <span className="text-[10px] tracking-widest uppercase font-black">UPI</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('gateway')}
                          className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${
                            paymentMethod === 'gateway'
                              ? 'bg-amber-600 border-amber-600 text-white shadow-2xl shadow-amber-900/40'
                              : 'bg-black/20 border-neutral-800 text-neutral-500 hover:border-amber-600/30'
                          }`}
                        >
                          <CreditCard size={18} className={`${paymentMethod === 'gateway' ? 'opacity-100' : 'opacity-40'}`} />
                          <span className="text-[10px] tracking-widest uppercase font-black">Card</span>
                        </button>
                      </div>

                      {/* UPI Info Card */}
                      {paymentMethod === 'upi' && artist.upi_id && !showSupport && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-black/30 p-6 rounded-2xl border border-neutral-800/50"
                        >
                          <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-black mb-2">Authenticated UPI ID</p>
                          <code className="text-amber-500/80 font-mono text-sm break-all">{artist.upi_id}</code>
                        </motion.div>
                      )}

                      {/* Receipt Breakdown */}
                      {amount && parseFloat(amount) > 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="space-y-4 pt-6 border-t border-neutral-800/80 mt-2"
                        >
                          <div className="flex justify-between items-center text-[10px] text-neutral-500 tracking-widest uppercase font-bold px-1">
                            <span>Contribution</span>
                            <span className="text-white">₹{parseFloat(amount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-neutral-500 tracking-widest uppercase font-bold px-1">
                            <span>Platform Fee (5%)</span>
                            <span className="text-orange-500/80">-₹{platformFee}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 px-1">
                            <span className="text-xs text-neutral-300 tracking-wider uppercase font-black">Artist Receives</span>
                            <span className="text-2xl font-medium text-green-500">₹{artistReceives}</span>
                          </div>
                        </motion.div>
                      )}

                      {showSupport && paymentMethod === 'upi' && artist.upi_qr_code && (
                        <div className="bg-white p-8 rounded-3xl text-center shadow-inner">
                          <img src={artist.upi_qr_code} alt="UPI QR Code" className="w-56 h-56 mx-auto mb-4" />
                          <p className="text-[10px] tracking-widest uppercase font-black text-neutral-400">Scan to contribute</p>
                        </div>
                      )}

                      <button
                        onClick={handleSupport}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-[1.25rem] text-sm tracking-[0.25em] uppercase font-black transition-all shadow-2xl shadow-amber-900/40 active:scale-[0.98] group/mainbtn"
                      >
                        <span className="group-hover:tracking-[0.3em] transition-all duration-500">
                          {paymentMethod === 'upi' 
                            ? (artist.upi_qr_code ? 'Present QR Code' : 'Pay via UPI')
                            : 'Initialize Gateway'
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Portfolio Preview - Cleaner */}
                {artworkCount > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-black">Portfolio Highlight</h4>
                      <button 
                         onClick={() => {
                          setIsPortfolioExpanded(!isPortfolioExpanded)
                          if (!isPortfolioExpanded) setShowArtworks(false)
                        }}
                        className="text-[10px] text-amber-600 uppercase tracking-widest font-black hover:text-amber-500 transition-colors"
                      >
                        {isPortfolioExpanded ? 'Hide' : `Gallery (${artworkCount})`}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {(isPortfolioExpanded ? artworks : artworks.slice(0, 4)).map((artwork) => (
                        <motion.div 
                          key={artwork.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-600/30 transition-all cursor-pointer group/art relative"
                          onClick={() => {
                            if (!isPortfolioExpanded) {
                              setIsPortfolioExpanded(true)
                            }
                            router.push(`/gallery?artwork=${artwork.id}`)
                          }}
                        >
                          <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover group-hover/art:scale-110 transition-transform duration-700" title={artwork.title} />
                          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/art:opacity-100 transition-opacity">
                            <p className="text-[9px] text-white/70 uppercase tracking-widest truncate">{artwork.title}</p>
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
