'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { X, Share2, Download, ShoppingCart, Send, Star, CheckCircle2, XCircle, Edit, UserPlus, UserCheck, Heart, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Artwork {
  id: number | string
  title: string
  artist: string
  artist_id?: string
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
  const [rating, setRating] = useState(5)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingComments, setLoadingComments] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [artistInfo, setArtistInfo] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [supportAmount, setSupportAmount] = useState('')
  const [showSupport, setShowSupport] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square'>('landscape')
  const [activeInput, setActiveInput] = useState<HTMLElement | null>(null)
  const [editForm, setEditForm] = useState({
    title: artwork.title,
    description: artwork.description || '',
    price: artwork.price.toString(),
    medium: artwork.medium || '',
    dimensions: artwork.dimensions || '',
    category_id: artwork.category_id || ''
  })

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    document.body.style.overflow = 'hidden'
    loadComments()
    checkOwnership()
    loadCategories()
    loadArtistInfo()
    incrementArtworkView()
    
    // Handle input focus for mobile keyboard
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setActiveInput(target)
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }
    
    const handleBlur = () => {
      setActiveInput(null)
    }
    
    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)
    
    const channel = supabase
      .channel('reviews-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reviews', filter: `artwork_id=eq.${artwork.id}` },
        () => loadComments()
      )
      .subscribe()
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
      supabase.removeChannel(channel)
    }
  }, [artwork.id])

  const incrementArtworkView = async () => {
    if (!artwork.artist_id) return
    const { data: artist } = await supabase.from('users').select('total_views').eq('id', artwork.artist_id).single()
    if (artist) {
      await supabase.from('users').update({ total_views: artist.total_views + 1 }).eq('id', artwork.artist_id)
    }
  }

  const loadArtistInfo = async () => {
    if (!artwork.artist_id) return
    const { data } = await supabase.from('users').select('*').eq('id', artwork.artist_id).single()
    if (data) {
      setArtistInfo(data)
      const user = getCurrentUser()
      if (user) {
        const { data: follow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.user_id)
          .eq('following_id', artwork.artist_id)
          .single()
        setIsFollowing(!!follow)
      }
    }
  }

  const checkOwnership = async () => {
    const user = getCurrentUser()
    if (user && artwork.artist_id) {
      setIsOwner(user.user_id === artwork.artist_id)
    }
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setCategories(data || [])
  }

  const loadComments = async () => {
    if (typeof artwork.id !== 'string') return
    
    setLoadingComments(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('id, comment, rating, reviewer_id, created_at')
      .eq('artwork_id', artwork.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (error || !data) {
      setLoadingComments(false)
      return
    }
    
    const reviewerIds = [...new Set(data.map(r => r.reviewer_id))]
    const { data: users } = await supabase.from('users').select('id, full_name').in('id', reviewerIds)
    const userMap: Record<string, string> = {}
    users?.forEach(u => { userMap[u.id] = u.full_name })
    
    setComments(data.map(r => ({
      id: r.id,
      comment: r.comment || '',
      rating: r.rating,
      reviewer_name: userMap[r.reviewer_id] || 'Anonymous',
      created_at: r.created_at
    })))
    setLoadingComments(false)
  }

  const requireAuth = (action: () => void) => {
    if (!getCurrentUser()) {
      onClose()
      onShowAuthPrompt?.()
      return
    }
    action()
  }

  const handleAddComment = async () => {
    requireAuth(async () => {
      if (!comment.trim() || typeof artwork.id !== 'string') return
      
      const user = getCurrentUser()
      if (!user) return
      
      setLoading(true)
      const { data, error } = await supabase.from('reviews').insert({
        reviewer_id: user.user_id,
        artwork_id: artwork.id,
        comment: comment.trim(),
        rating: rating,
        status: 'approved'
      }).select('id, comment, rating, reviewer_id, created_at').single()
      
      if (error) {
        toast.error(
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
              <XCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="font-medium text-white">Failed to add comment</p>
              <p className="text-xs text-neutral-400">Please try again</p>
            </div>
          </div>,
          { duration: 3000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '12px' } }
        )
      } else if (data) {
        toast.success(
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-white">Comment added!</p>
              <p className="text-xs text-neutral-400">Your review is now visible</p>
            </div>
          </div>,
          { duration: 3000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '16px', borderRadius: '12px' } }
        )
        setComments(prev => [{
          id: data.id,
          comment: data.comment || '',
          rating: data.rating,
          reviewer_name: user.user_name,
          created_at: data.created_at
        }, ...prev])
        setComment('')
        setRating(5)
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
        alert(`Demo artwork – real purchases are for items from our collection. Browse "Live collection" on the gallery.`)
      }
    })
  }

  const handleShare = () => {
    requireAuth(() => {
      const shareUrl = `${window.location.origin}/gallery?artwork=${artwork.id}`
      if (navigator.share) {
        navigator.share({
          title: artwork.title,
          text: `Check out "${artwork.title}" by ${artwork.artist}`,
          url: shareUrl,
        })
      } else {
        navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard')
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
        link.href = url
        link.download = `${artwork.title}.jpg`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Download failed:', error)
      }
    })
  }

  const handleSaveEdit = async () => {
    if (typeof artwork.id !== 'string') return
    
    setLoading(true)
    const { error } = await supabase
      .from('artworks')
      .update({
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price),
        medium: editForm.medium,
        dimensions: editForm.dimensions,
        category_id: editForm.category_id
      })
      .eq('id', artwork.id)

    if (error) {
      toast.custom((t) => (
        <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <XCircle size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>Update Failed</div>
            <div style={{ color: '#a3a3a3', fontSize: '14px' }}>Could not save changes</div>
          </div>
        </div>
      ))
    } else {
      toast.custom((t) => (
        <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid #10b981', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>Artwork Updated</div>
            <div style={{ color: '#a3a3a3', fontSize: '14px' }}>Refresh to see changes</div>
          </div>
        </div>
      ))
      setEditMode(false)
    }
    setLoading(false)
  }

  const toggleFollow = async () => {
    const user = getCurrentUser()
    if (!user) {
      toast.error('Please login to follow artists')
      return
    }
    if (!artwork.artist_id) return

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.user_id).eq('following_id', artwork.artist_id)
      setIsFollowing(false)
      toast.success('Unfollowed')
    } else {
      await supabase.from('follows').insert({ follower_id: user.user_id, following_id: artwork.artist_id })
      setIsFollowing(true)
      toast.success('Following')
    }
  }
  const handleSupport = () => {
    const user = getCurrentUser()
    if (!user) {
      toast.error('Please login to support artists')
      return
    }
    if (!supportAmount || parseFloat(supportAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    router.push(`/checkout?type=support&artistId=${artwork.artist_id}&amount=${supportAmount}`)
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    const ratio = naturalWidth / naturalHeight
    if (ratio < 0.8) setOrientation('portrait')
    else if (ratio > 1.2) setOrientation('landscape')
    else setOrientation('square')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: viewportHeight ? `${viewportHeight * 0.9}px` : '90vh' }} 
        className={`relative bg-neutral-950 border border-white/5 rounded-[3rem] w-full overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col md:flex-row transition-all duration-500 ${
            orientation === 'portrait' ? 'max-w-4xl' : 'max-w-7xl'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Scale Artwork Presentation */}
        <div className={`relative flex-1 flex items-center justify-center overflow-hidden p-6 md:p-8 transition-all duration-500 ${
          orientation === 'portrait' ? 'bg-neutral-900/40' : 'bg-neutral-900/10'
        }`}>
            <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-3xl pointer-events-none" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative max-w-full max-h-full flex items-center justify-center shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden"
            >
              <img 
                src={artwork.image} 
                alt={artwork.title} 
                onLoad={handleImageLoad}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl" 
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }} 
              />
            </motion.div>
        </div>

        {/* Information Sidepanel - Glassmorphic Luxury */}
        <div className="w-full md:w-[450px] bg-neutral-950/30 backdrop-blur-3xl border-l border-white/5 flex flex-col overflow-y-auto scrollbar-hide">
          <div className="p-8 md:p-10 pb-12 space-y-12 flex-1">
            
            {/* Scrollable Header Actions */}
            <div className="flex items-center justify-between pb-8 border-b border-white/5">
               <div className="flex items-center gap-3">
                 <button onClick={handleShare} className="p-3.5 rounded-2xl bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                   <Share2 size={16} />
                 </button>
                 <button onClick={handleDownload} className="p-3.5 rounded-2xl bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                   <Download size={16} />
                 </button>
               </div>
               <button 
                onClick={onClose} 
                className="p-3.5 rounded-2xl bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
               >
                 <X size={18} />
               </button>
            </div>
            
            {/* Title & Metadata Block */}
            <div className="space-y-6">
               <div className="space-y-2">
                 <p className="text-amber-600/60 text-[10px] tracking-[0.4em] font-black uppercase">Masterpiece</p>
                 <h2 className="text-5xl font-light text-white tracking-tight leading-[1.1]" style={{ fontFamily: 'ForestSmooth, serif' }}>
                   {artwork.title}
                 </h2>
                 <p className="text-neutral-500 text-xs tracking-[0.2em] font-black uppercase opacity-60">
                    by {artwork.artist}
                 </p>
               </div>

               <div className="flex flex-wrap gap-3">
                 <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-neutral-400 tracking-widest font-black uppercase">
                   {artwork.category}
                 </span>
                 {artwork.year_created && (
                   <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-neutral-400 tracking-widest font-black uppercase">
                     Circa {artwork.year_created}
                   </span>
                 )}
               </div>
            </div>

            {/* Description & Specs */}
            <div className="space-y-6">
               <p className="text-neutral-400 text-sm leading-relaxed font-light tracking-wide italic">
                 {artwork.description || "A captivating display of artistic vision and technical mastery, evoking deep emotion and contemplation."}
               </p>
               
               <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                 <div className="space-y-1">
                   <p className="text-[8px] text-neutral-500 tracking-[0.2em] font-black uppercase">Dimensions</p>
                   <p className="text-xs text-white font-medium">{artwork.dimensions || "N/A"}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[8px] text-neutral-500 tracking-[0.2em] font-black uppercase">Medium</p>
                   <p className="text-xs text-white font-medium">{artwork.medium || "N/A"}</p>
                 </div>
               </div>
            </div>

            {/* Acquisition Block */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-neutral-900/50 to-neutral-900/20 border border-white/5 space-y-8">
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <p className="text-[8px] text-amber-600/60 tracking-[0.3em] font-black uppercase">Valuation</p>
                   <p className="text-3xl font-light text-white">₹{artwork.price.toLocaleString()}</p>
                 </div>
                 <div className="h-10 w-10 rounded-2xl bg-amber-600/10 flex items-center justify-center border border-amber-600/20">
                   <ShoppingCart size={18} className="text-amber-600" />
                 </div>
               </div>

               <button 
                onClick={handlePurchase}
                className="w-full py-5 rounded-[1.5rem] bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-[0.98]"
               >
                 Acquire Piece
               </button>
            </div>

            {/* Comments Section - Refined */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm tracking-[0.3em] font-black uppercase text-neutral-500">Dialogue</h3>
                 <span className="text-[9px] text-neutral-600">{comments.length} Contributions</span>
               </div>

               <div className="space-y-4">
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleAddComment()}
                      placeholder="Share your perspective..." 
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-6 pr-14 py-4 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:bg-white/10 transition-all font-light"
                    />
                    <button 
                      onClick={handleAddComment}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-amber-600/20 text-amber-600 flex items-center justify-center hover:bg-amber-600/40 transition-all disabled:opacity-30"
                    >
                      <Send size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {comments.slice(0, 3).map((c) => (
                      <div key={c.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{c.reviewer_name}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed font-light">{c.comment}</p>
                      </div>
                    ))}
                    {comments.length > 3 && (
                      <button className="w-full py-3 text-[9px] text-neutral-600 font-black uppercase tracking-widest hover:text-neutral-400 transition-colors">
                        View all discussions
                      </button>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Action Row - Minimal Footer */}
          <div className="p-8 border-t border-white/5 flex items-center justify-end bg-neutral-900/40">
             {artistInfo && (
               <button onClick={toggleFollow} className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                 isFollowing ? 'text-neutral-500 border border-white/5' : 'bg-amber-600/20 text-amber-600 border border-amber-600/30'
               }`}>
                 {isFollowing ? 'Following Artist' : 'Follow Artist'}
               </button>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
