'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { X, Share2, Download, ShoppingCart, Send, Star, CheckCircle2, XCircle, Edit, UserPlus, UserCheck, Heart, Eye } from 'lucide-react'
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
        const response = await fetch(artwork.image)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${artwork.title}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Download failed:', error)
        toast.error('Download failed')
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
      <div style={{ height: viewportHeight ? `${viewportHeight * 0.95}px` : '95vh' }} className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-600/20 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-neutral-900/95 backdrop-blur-xl border-b border-amber-600/20">
          <div>
            <h2 className="text-xl font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{artwork.title}</h2>
            <p className="text-amber-600/70 text-xs tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>by {artwork.artist}</p>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="p-2 rounded-full bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 transition-all"
                title="Edit artwork"
              >
                <Edit size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.5fr,1fr] gap-4 p-4 overflow-y-auto flex-1 scrollbar-hide">
          <div className="relative rounded-xl overflow-hidden bg-black/40 border border-amber-600/10" style={{ maxHeight: '70vh' }}>
            <img src={artwork.image} alt="" className="w-full h-full object-contain" onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }} />
          </div>

          <div className="flex flex-col gap-4">
            {editMode ? (
              <div className="bg-black/40 rounded-xl p-4 border border-amber-600/20 space-y-3">
                <h3 className="text-white font-light text-base mb-2" style={{ fontFamily: 'ForestSmooth, serif' }}>Edit Artwork</h3>
                
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-600/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-600/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Category</label>
                    <select
                      value={editForm.category_id}
                      onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-600/50"
                    >
                      <option value="">Select</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Medium</label>
                    <input
                      type="text"
                      value={editForm.medium}
                      onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-600/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={editForm.dimensions}
                      onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-600/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-600/50 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all text-sm disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-black/40 border border-amber-600/20 text-amber-600 rounded-lg hover:bg-amber-600/10 transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
            {artistInfo && (
              <div className="bg-black/40 rounded-xl p-4 border border-amber-600/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0">
                    {artistInfo.avatar_url ? (
                      <img src={artistInfo.avatar_url} alt={artistInfo.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-amber-600/30">
                        {artistInfo.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-light text-sm">{artistInfo.full_name}</h4>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1"><Heart size={12} />{artistInfo.followers_count}</span>
                      <span className="flex items-center gap-1"><Eye size={12} />{artistInfo.total_views}</span>
                    </div>
                  </div>
                  <button
                    onClick={toggleFollow}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                      isFollowing
                        ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                        : 'bg-amber-600 text-white hover:bg-amber-500'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
                {artistInfo.bio && <p className="text-neutral-400 text-xs mb-3">{artistInfo.bio}</p>}
                {!showSupport ? (
                  <button
                    onClick={() => setShowSupport(true)}
                    className="w-full px-3 py-2 bg-amber-600/20 border border-amber-600/50 text-amber-600 rounded-lg hover:bg-amber-600/30 transition-all text-xs"
                  >
                    Support Artist
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={supportAmount}
                      onChange={(e) => setSupportAmount(e.target.value)}
                      placeholder="Enter amount (₹)"
                      className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-xs focus:outline-none focus:border-amber-600/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSupport}
                        className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-all text-xs"
                      >
                        Send Support
                      </button>
                      <button
                        onClick={() => setShowSupport(false)}
                        className="px-3 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-all text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="bg-black/40 rounded-xl p-4 border border-amber-600/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-600 font-light text-2xl" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{artwork.price.toLocaleString()}</span>
                <span className="text-xs text-amber-600/70 uppercase tracking-widest px-2 py-1 bg-amber-600/10 rounded-full border border-amber-600/30" style={{ fontFamily: 'Oughter, serif' }}>{artwork.category}</span>
              </div>
              {artwork.description && (
                <p className="text-neutral-300 text-sm leading-relaxed mb-3">{artwork.description}</p>
              )}
              {(artwork.medium || artwork.dimensions || artwork.year_created) && (
                <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                  {artwork.medium && <span>• {artwork.medium}</span>}
                  {artwork.dimensions && <span>• {artwork.dimensions}</span>}
                  {artwork.year_created && <span>• {artwork.year_created}</span>}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all flex items-center justify-center gap-2 text-sm font-light" onClick={handlePurchase}>
                <ShoppingCart size={16} />
                Purchase
              </button>
              {artistInfo && (
                <>
                  <button
                    onClick={toggleFollow}
                    className={`px-4 py-2.5 rounded-lg transition-all text-sm flex items-center gap-2 ${
                      isFollowing
                        ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                        : 'bg-amber-600/20 border border-amber-600/50 text-amber-600 hover:bg-amber-600/30'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  </button>
                  <button
                    onClick={() => setShowSupport(!showSupport)}
                    className="px-4 py-2.5 bg-amber-600/20 border border-amber-600/50 text-amber-600 rounded-lg hover:bg-amber-600/30 transition-all text-sm"
                  >
                    Support
                  </button>
                </>
              )}
              <button className="px-3 py-2.5 bg-black/40 border border-amber-600/20 text-amber-600 rounded-lg hover:bg-amber-600/10 transition-all" onClick={handleDownload}>
                <Download size={16} />
              </button>
              <button className="px-3 py-2.5 bg-black/40 border border-amber-600/20 text-amber-600 rounded-lg hover:bg-amber-600/10 transition-all" onClick={handleShare}>
                <Share2 size={16} />
              </button>
            </div>

            {showSupport && artistInfo && (
              <div className="bg-black/40 rounded-xl p-4 border border-amber-600/20">
                <h3 className="text-white font-light text-sm mb-3">Support {artistInfo.full_name}</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={supportAmount}
                    onChange={(e) => setSupportAmount(e.target.value)}
                    placeholder="Enter amount (₹)"
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-amber-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-600/50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSupport}
                      className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-all text-sm"
                    >
                      Send Support
                    </button>
                    <button
                      onClick={() => setShowSupport(false)}
                      className="px-3 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 bg-black/40 rounded-xl p-4 border border-amber-600/20 flex flex-col">
              <h3 className="text-white font-light text-base mb-3" style={{ fontFamily: 'ForestSmooth, serif' }}>Comments</h3>
              
              <div className="mb-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="transition-colors">
                      <Star size={18} fill={star <= rating ? '#d97706' : 'none'} className={star <= rating ? 'text-amber-600' : 'text-neutral-600'} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleAddComment()}
                    placeholder="Add a comment..."
                    disabled={loading}
                    className="flex-1 bg-neutral-900/50 border border-amber-600/20 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/20 text-sm transition-all"
                  />
                  <button onClick={handleAddComment} disabled={loading} className="px-4 py-2 bg-amber-600/20 border border-amber-600/50 text-amber-600 rounded-lg hover:bg-amber-600/30 transition-all disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {loadingComments ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-neutral-900/50 rounded-lg p-3 border border-amber-600/10 animate-pulse">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-3 bg-neutral-800 rounded w-24"></div>
                          <div className="h-3 bg-neutral-800 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-neutral-800 rounded w-full mb-1"></div>
                        <div className="h-3 bg-neutral-800 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-neutral-500 text-xs">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-neutral-900/50 rounded-lg p-3 border border-amber-600/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-neutral-300 text-xs font-medium">{c.reviewer_name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={12} fill={star <= c.rating ? '#d97706' : 'none'} className={star <= c.rating ? 'text-amber-600' : 'text-neutral-700'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-400 text-xs">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
