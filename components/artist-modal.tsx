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
        const totalAmount = parseFloat(amount)
        const fee = parseFloat(platformFee)
        const upiUrl = `upi://pay?pa=${artist.upi_id}&pn=${encodeURIComponent(artist.full_name)}&am=${artistReceives}&cu=INR&tn=Support%20Payment`
        
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
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{ height: viewportHeight ? `${viewportHeight * 0.98}px` : '98vh' }}
          className="bg-neutral-950 border border-amber-600/30 rounded-2xl sm:rounded-3xl max-w-7xl w-full sm:max-h-[95vh] overflow-hidden shadow-2xl shadow-amber-600/20 flex flex-col"
        >
          {/* Header */}
          <div className="relative h-14 sm:h-16 bg-neutral-900 border-b border-neutral-800 flex-shrink-0">
            <button 
              onClick={onClose} 
              className="absolute top-3 sm:top-5 right-3 sm:right-4 text-neutral-400 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-full z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 scrollbar-hide">
            <div className="flex flex-col lg:grid lg:grid-cols-[340px,1fr]">
              {/* Left Sidebar - Artist Info */}
              <div className="bg-neutral-900 lg:border-r border-neutral-800 p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto rounded-lg overflow-hidden bg-neutral-800 border-2 border-neutral-700 shadow-xl">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl text-neutral-600 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {artist.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Artist Details */}
                  <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-light text-white mb-2" style={{ fontFamily: 'ForestSmooth, serif' }}>{artist.full_name}</h3>
                    <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm mb-3">
                      {artist.location && (
                        <>
                          <MapPin size={14} className="text-amber-600" />
                          <span>{artist.location}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-neutral-500 text-xs">
                      <Calendar size={14} />
                      <span>Member since {new Date(artist.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-neutral-800/30 rounded-lg p-3 text-center border border-neutral-800">
                      <Heart size={16} className="text-amber-600 mx-auto mb-1" />
                      <p className="text-white font-semibold text-base sm:text-lg">{artist.followers_count}</p>
                      <p className="text-neutral-500 text-[9px] sm:text-[10px]">Followers</p>
                    </div>
                    <div className="bg-neutral-800/30 rounded-lg p-3 text-center border border-neutral-800">
                      <Eye size={16} className="text-purple-400 mx-auto mb-1" />
                      <p className="text-white font-semibold text-base sm:text-lg">{artist.total_views}</p>
                      <p className="text-neutral-500 text-[9px] sm:text-[10px]">Views</p>
                    </div>
                    <div className="bg-neutral-800/30 rounded-lg p-3 text-center border border-neutral-800">
                      <Palette size={16} className="text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-semibold text-base sm:text-lg">{artworkCount}</p>
                      <p className="text-neutral-500 text-[9px] sm:text-[10px]">Works</p>
                    </div>
                    <div className="bg-neutral-800/30 rounded-lg p-3 text-center border border-neutral-800">
                      <TrendingUp size={16} className="text-green-400 mx-auto mb-1" />
                      <p className="text-white font-semibold text-base sm:text-lg">{Math.floor(artist.total_views / Math.max(artworkCount, 1))}</p>
                      <p className="text-neutral-500 text-[9px] sm:text-[10px]">Avg</p>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                      <Award size={16} />
                      About Artist
                    </h4>
                    {artist.bio ? (
                      <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-800">
                        <p className="text-neutral-300 text-sm leading-relaxed">{artist.bio}</p>
                      </div>
                    ) : (
                      <p className="text-neutral-500 text-sm italic">No bio available</p>
                    )}
                  </div>

                  {/* Website */}
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm transition-colors border border-neutral-700"
                    >
                      <ExternalLink size={16} />
                      Visit Website
                    </a>
                  )}

                  {/* Follow Button */}
                  <button
                    onClick={toggleFollow}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                      isFollowing
                        ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                        : 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-600/20'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                    {isFollowing ? 'Following' : 'Follow Artist'}
                  </button>
                </div>
              </div>

              {/* Right Content - Artworks & Support */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

                {/* Featured Artworks Section */}
                {isPortfolioExpanded && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-xl sm:text-2xl font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>Portfolio</h4>
                        <p className="text-neutral-400 text-sm">{artworkCount} {artworkCount === 1 ? 'artwork' : 'artworks'} available</p>
                      </div>
                      {artworks.length > 0 && (
                        <button
                          onClick={() => setShowArtworks(!showArtworks)}
                          className="px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm transition-all border border-neutral-700 hover:border-amber-600/50"
                        >
                          {showArtworks ? 'Hide' : 'Expand'}
                        </button>
                      )}
                    </div>
                    
                    {artworks.length === 0 ? (
                      <div className="bg-neutral-900/50 rounded-xl p-12 text-center border border-neutral-800">
                        <Palette size={48} className="text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-500">No artworks available yet</p>
                      </div>
                    ) : showArtworks ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                        {artworks.map((artwork) => (
                          <motion.div 
                            key={artwork.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-amber-600/50 transition-all hover:shadow-xl hover:shadow-amber-600/10"
                          >
                            <div className="aspect-square relative overflow-hidden bg-neutral-800">
                              <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-2 p-4">
                                <button
                                  onClick={() => handleShare(artwork)}
                                  className="p-2.5 bg-neutral-900/90 backdrop-blur-sm rounded-full hover:bg-amber-600 transition-colors"
                                  title="Share"
                                >
                                  <Share2 size={16} className="text-white" />
                                </button>
                                <button
                                  onClick={() => router.push(`/gallery?artwork=${artwork.id}`)}
                                  className="p-2.5 bg-neutral-900/90 backdrop-blur-sm rounded-full hover:bg-amber-600 transition-colors"
                                  title="View Details"
                                >
                                  <ExternalLink size={16} className="text-white" />
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h5 className="text-white text-sm font-medium truncate mb-1">{artwork.title}</h5>
                              <div className="flex items-center justify-between">
                                <p className="text-amber-600 text-base font-semibold">₹{Number(artwork.price).toLocaleString()}</p>
                                {artwork.category && (
                                  <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">{artwork.category}</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {artworks.slice(0, 4).map((artwork) => (
                          <div 
                            key={artwork.id}
                            className="aspect-square rounded-lg overflow-hidden border border-neutral-800 hover:border-amber-600/50 transition-all cursor-pointer"
                            onClick={() => setShowArtworks(true)}
                          >
                            <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Portfolio Toggle Button */}
                {artworkCount > 0 && (
                  <button
                    onClick={() => {
                      setIsPortfolioExpanded(!isPortfolioExpanded)
                      if (!isPortfolioExpanded) setShowArtworks(false)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-all border border-neutral-700 hover:border-amber-600/50"
                  >
                    <Palette size={18} />
                    {isPortfolioExpanded ? 'Hide Portfolio' : `View Portfolio (${artworkCount})`}
                  </button>
                )}

                {/* Support Section */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-4 sm:p-6 border border-amber-600/30">
                  <h4 className="text-xl sm:text-2xl font-light text-white mb-4 sm:mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>Support This Artist</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">Amount (₹)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        disabled={!artist.upi_id && !artist.upi_qr_code}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition-all ${
                          paymentMethod === 'upi'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20'
                            : (!artist.upi_id && !artist.upi_qr_code)
                            ? 'bg-neutral-800/50 border-neutral-700/50 text-neutral-600 cursor-not-allowed opacity-50'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
                        }`}
                      >
                        <QrCode size={20} />
                        UPI
                      </button>
                      <button
                        onClick={() => setPaymentMethod('gateway')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition-all ${
                          paymentMethod === 'gateway'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
                        }`}
                      >
                        <CreditCard size={20} />
                        Card
                      </button>
                    </div>

                    {paymentMethod === 'upi' && artist.upi_id && !showSupport && (
                      <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                        <p className="text-sm text-neutral-400 mb-2">UPI ID</p>
                        <code className="text-amber-600 font-mono text-sm sm:text-base break-all">{artist.upi_id}</code>
                      </div>
                    )}

                    {paymentMethod === 'upi' && amount && parseFloat(amount) > 0 && (
                      <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">Amount</span>
                          <span className="text-white">₹{parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">Platform Fee (5%)</span>
                          <span className="text-orange-400">-₹{platformFee}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-neutral-700">
                          <span className="text-neutral-300 font-medium">Artist Receives</span>
                          <span className="text-green-400 font-semibold">₹{artistReceives}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Platform fee goes to: gaming.network.studio.mg@okicici</p>
                      </div>
                    )}

                    {showSupport && paymentMethod === 'upi' && artist.upi_qr_code && (
                      <div className="bg-white p-6 rounded-xl text-center">
                        <img src={artist.upi_qr_code} alt="UPI QR Code" className="w-64 h-64 mx-auto mb-4" />
                        <p className="text-sm text-neutral-600">Scan to pay ₹{amount}</p>
                      </div>
                    )}

                    <button
                      onClick={handleSupport}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3.5 rounded-lg font-medium transition-all shadow-lg shadow-amber-600/20"
                    >
                      {paymentMethod === 'upi' 
                        ? (artist.upi_qr_code ? 'Show QR Code' : 'Pay via UPI')
                        : 'Proceed to Payment'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
