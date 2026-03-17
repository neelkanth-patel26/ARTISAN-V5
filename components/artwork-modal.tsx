'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { X, Share2, Download, ShoppingCart, Send, CheckCircle2, XCircle, UserPlus, UserCheck, Heart, Eye, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Artwork {
  id: number | string
  title: string
  artist: string
  artistId?: string
  category: string
  category_id?: string
  image: string
  price: number
  likes?: number
  description?: string
  medium?: string
  dimensions?: string
  year_created?: number
}

interface Comment {
  id: string
  comment: string
  rating: number
  reviewer_name: string
  created_at: string
}

interface ArtworkModalProps {
  artwork: Artwork
  onClose: () => void
  onShowAuthPrompt?: () => void
}

export function ArtworkModal({ artwork, onClose, onShowAuthPrompt }: ArtworkModalProps) {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingComments, setLoadingComments] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [artistInfo, setArtistInfo] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square'>('landscape')
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    document.body.style.overflow = 'hidden'
    loadComments()
    checkOwnership()
    loadArtistInfo()
    incrementArtworkView()

    const channel = supabase
      .channel('reviews-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reviews', filter: `artwork_id=eq.${artwork.id}` },
        () => loadComments()
      )
      .subscribe()

    return () => {
      document.body.style.overflow = 'unset'
      supabase.removeChannel(channel)
    }
  }, [artwork.id])

  const incrementArtworkView = async () => {
    if (!artwork.artistId) return
    const { data: artist } = await supabase.from('users').select('total_views').eq('id', artwork.artistId).single()
    if (artist) await supabase.from('users').update({ total_views: artist.total_views + 1 }).eq('id', artwork.artistId)
  }

  const loadArtistInfo = async () => {
    if (!artwork.artistId) return
    const { data } = await supabase.from('users').select('*').eq('id', artwork.artistId).single()
    if (data) {
      setArtistInfo(data)
      const user = getCurrentUser()
      if (user) {
        const { data: follow } = await supabase
          .from('follows').select('id')
          .eq('follower_id', user.user_id).eq('following_id', artwork.artistId).single()
        setIsFollowing(!!follow)
      }
    }
  }

  const checkOwnership = () => {
    const user = getCurrentUser()
    if (user && artwork.artistId) setIsOwner(user.user_id === artwork.artistId)
  }

  const loadComments = async () => {
    if (typeof artwork.id !== 'string') return
    setLoadingComments(true)
    const { data, error } = await supabase
      .from('reviews').select('id, comment, rating, reviewer_id, created_at')
      .eq('artwork_id', artwork.id).eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const reviewerIds = [...new Set(data.map(r => r.reviewer_id))]
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', reviewerIds)
      const userMap: Record<string, string> = {}
      users?.forEach(u => { userMap[u.id] = u.full_name })
      setComments(data.map(r => ({
        id: r.id, comment: r.comment || '', rating: r.rating,
        reviewer_name: userMap[r.reviewer_id] || 'Anonymous', created_at: r.created_at
      })))
    }
    setLoadingComments(false)
  }

  const requireAuth = (action: () => void) => {
    if (!getCurrentUser()) { onClose(); onShowAuthPrompt?.(); return }
    action()
  }

  const handleAddComment = async () => {
    requireAuth(async () => {
      if (!comment.trim() || typeof artwork.id !== 'string') return
      const user = getCurrentUser()
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase.from('reviews').insert({
        reviewer_id: user.user_id, artwork_id: artwork.id,
        comment: comment.trim(), rating: 5, status: 'approved'
      }).select('id, comment, rating, reviewer_id, created_at').single()

      if (error) {
        toast.error('Failed to add comment')
      } else if (data) {
        toast.success('Comment added!')
        setComments(prev => [{ id: data.id, comment: data.comment || '', rating: data.rating, reviewer_name: user.user_name, created_at: data.created_at }, ...prev])
        setComment('')
      }
      setLoading(false)
    })
  }

  const handlePurchase = () => {
    requireAuth(() => {
      if (typeof artwork.id === 'string') {
        onClose()
        router.push('/checkout?artwork_id=' + encodeURIComponent(artwork.id))
      } else {
        alert('Demo artwork – real purchases are for items from our live collection.')
      }
    })
  }

  const handleShare = () => {
    requireAuth(() => {
      const shareUrl = `${window.location.origin}/gallery?artwork=${artwork.id}`
      if (navigator.share) {
        navigator.share({ title: artwork.title, text: `Check out "${artwork.title}" by ${artwork.artist}`, url: shareUrl })
      } else {
        navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied!')
      }
    })
  }

  const handleDownload = async () => {
    requireAuth(async () => {
      try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(artwork.image)}&filename=${encodeURIComponent(artwork.title)}.jpg`)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url; link.download = `${artwork.title}.jpg`; link.click()
        window.URL.revokeObjectURL(url)
      } catch { toast.error('Download failed') }
    })
  }

  const toggleFollow = async () => {
    const user = getCurrentUser()
    if (!user) { toast.error('Please login to follow artists'); return }
    if (!artwork.artistId) return
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.user_id).eq('following_id', artwork.artistId)
      setIsFollowing(false)
      toast.success('Unfollowed')
    } else {
      await supabase.from('follows').insert({ follower_id: user.user_id, following_id: artwork.artistId })
      setIsFollowing(true)
      toast.success('Now following')
    }
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    const ratio = naturalWidth / naturalHeight
    if (ratio < 0.8) setOrientation('portrait')
    else if (ratio > 1.2) setOrientation('landscape')
    else setOrientation('square')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-[24px]"
      onClick={onClose}
    >
      {/* Atmospheric glows behind modal */}
      <div className="pointer-events-none absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-600/[0.06] rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/[0.04] rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 60 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxHeight: viewportHeight ? `${viewportHeight * 0.95}px` : '95vh' }}
        className={`relative bg-neutral-950 border border-white/[0.07] rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] flex flex-col md:flex-row ${
          orientation === 'portrait' ? 'max-w-5xl' : 'max-w-[98vw] 2xl:max-w-[1800px]'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left: Image Panel ── */}
        <div className="relative hidden md:flex items-center justify-center overflow-hidden shrink-0 bg-black/60 md:w-1/2">
          <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-3xl pointer-events-none" />

          {/* Subtle orange glow on image */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/[0.06] blur-[60px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className={`relative flex items-center justify-center ${
              orientation === 'portrait' ? 'w-[95%] h-[95%]' : 'w-full h-full'
            }`}
          >
            <img
              src={artwork.image}
              alt={artwork.title}
              onLoad={handleImageLoad}
              onContextMenu={e => e.preventDefault()}
              className="w-full h-full object-contain rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] block"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </motion.div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 sm:hidden p-3 rounded-2xl bg-black/60 backdrop-blur-xl text-white/70 border border-white/10 active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Right: Info Panel ── */}
        <div className="relative flex-1 flex flex-col min-h-0 md:border-l border-white/[0.05] md:w-1/2">
          <div className="flex-1 overflow-y-auto scrollbar-hide pb-28 sm:pb-6">
            <div className="p-7 md:p-10 space-y-8">

              {/* Desktop top bar */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={handleShare} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-500 hover:text-white hover:border-white/[0.1] transition-all">
                    <Share2 size={15} />
                  </button>
                  <button onClick={handleDownload} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-500 hover:text-white hover:border-white/[0.1] transition-all">
                    <Download size={15} />
                  </button>
                </div>
                <button onClick={onClose} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-500 hover:text-white hover:border-white/[0.1] transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Mobile action row */}
              <div className="flex sm:hidden items-center gap-3">
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-500">
                  <Share2 size={13} />
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>Share</span>
                </button>
                <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-500">
                  <Download size={13} />
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>Save</span>
                </button>
              </div>

              {/* Title block */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-[9px] tracking-[0.4em] uppercase font-black text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>
                      {artwork.category}
                    </span>
                  </div>
                  {artwork.year_created && (
                    <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                      {artwork.year_created}
                    </span>
                  )}
                </div>

                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1]" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  {artwork.title}
                </h2>

                <p className="text-[11px] text-neutral-500 font-black uppercase tracking-[0.3em]" style={{ fontFamily: 'Oughter, serif' }}>
                  by{' '}
                  <Link href={`/artist?id=${artwork.artistId}`} className="text-neutral-300 hover:text-orange-400 transition-colors">
                    {artwork.artist}
                  </Link>
                </p>
              </div>

              {/* Description */}
              {artwork.description && (
                <p className="text-[14px] text-neutral-400 leading-relaxed font-normal">
                  {artwork.description}
                </p>
              )}

              {/* Specs */}
              {(artwork.medium || artwork.dimensions) && (
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/[0.05]">
                  {artwork.medium && (
                    <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] space-y-2">
                      <p className="text-[8px] text-neutral-600 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Medium</p>
                      <p className="text-sm text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>{artwork.medium}</p>
                    </div>
                  )}
                  {artwork.dimensions && (
                    <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] space-y-2">
                      <p className="text-[8px] text-neutral-600 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Dimensions</p>
                      <p className="text-sm text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>{artwork.dimensions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Acquisition block — desktop */}
              <div className="hidden sm:block p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.04] blur-[40px] rounded-full pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] text-orange-500/60 tracking-[0.4em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Price</p>
                    <p className="text-4xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{artwork.price.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-[1.5rem] bg-orange-500/10 border border-orange-500/20">
                    <ShoppingCart size={20} className="text-orange-400" />
                  </div>
                </div>
                <button
                  onClick={handlePurchase}
                  className="relative w-full py-5 rounded-[1.5rem] bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] overflow-hidden group"
                  style={{ fontFamily: 'Oughter, serif' }}
                >
                  <span className="relative z-10">Acquire Piece</span>
                  <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </div>

              {/* Artist card */}
              {artistInfo && (
                <div className="pt-6 border-t border-white/[0.05]">
                  <p className="text-[9px] text-orange-500/60 uppercase tracking-[0.5em] font-black mb-4" style={{ fontFamily: 'Oughter, serif' }}>Artist</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1rem] bg-white/[0.03] border border-white/[0.08] overflow-hidden shrink-0">
                        {artistInfo.avatar_url ? (
                          <img src={artistInfo.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-light text-neutral-500" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {artistInfo.full_name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>{artistInfo.full_name}</p>
                        {artistInfo.location && (
                          <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>{artistInfo.location}</p>
                        )}
                      </div>
                    </div>
                    {!isOwner && (
                      <button
                        onClick={toggleFollow}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          isFollowing
                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400'
                            : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:border-orange-500/30 hover:text-orange-400'
                        }`}
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        {isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="pt-6 border-t border-white/[0.05] space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Dialogue</p>
                  <div className="flex items-center gap-2 text-[9px] text-neutral-600 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                    <Eye size={11} />
                    <span>{comments.length} reviews</span>
                  </div>
                </div>

                {/* Comment input */}
                <div className="relative">
                  <input
                    type="text"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !loading && handleAddComment()}
                    placeholder="Share your perspective..."
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl pl-5 pr-14 py-4 text-[13px] text-white placeholder:text-neutral-700 focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all font-light"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={loading || !comment.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center hover:bg-orange-500/20 transition-all disabled:opacity-30"
                  >
                    <Send size={14} />
                  </button>
                </div>

                {/* Comment list */}
                <div className="space-y-3">
                  {loadingComments ? (
                    <div className="py-6 flex justify-center">
                      <div className="w-5 h-5 rounded-full border border-orange-500/30 border-t-orange-400 animate-spin" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[10px] text-neutral-700 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>No reviews yet</p>
                    </div>
                  ) : (
                    comments.slice(0, 4).map(c => (
                      <div key={c.id} className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>{c.reviewer_name}</span>
                          <span className="text-[9px] text-neutral-700 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                            {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[13px] text-neutral-400 leading-relaxed font-light">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Mobile sticky acquisition bar */}
          <div className="fixed sm:hidden bottom-0 left-0 right-0 p-5 bg-neutral-950/90 backdrop-blur-2xl border-t border-white/[0.07] z-50 flex items-center gap-5">
            <div className="space-y-0.5">
              <p className="text-[8px] text-orange-500/60 tracking-[0.4em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Price</p>
              <p className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{artwork.price.toLocaleString()}</p>
            </div>
            <button
              onClick={handlePurchase}
              className="flex-1 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
              style={{ fontFamily: 'Oughter, serif' }}
            >
              Acquire Piece
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
