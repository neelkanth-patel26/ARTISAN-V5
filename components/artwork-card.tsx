'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { Heart, Share2, Download, ShoppingCart } from 'lucide-react'
import { AuthPromptModal } from './auth-prompt-modal'
import { toast } from 'sonner'

interface Artwork {
  id: number | string
  title: string
  artist: string
  category: string
  image: string
  price: number
  likes?: number
  artistId?: string
  description?: string
  medium?: string
  dimensions?: string
  year_created?: number
}

interface ArtworkCardProps {
  artwork: Artwork
  initialLiked?: boolean
  onLike?: (artworkId: string, isLiked: boolean) => void | Promise<void>
  onOpen?: (artwork: Artwork) => void
}

export function ArtworkCard({ artwork, initialLiked = false, onLike, onOpen }: ArtworkCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(artwork.likes ?? 0)
  const [isLiking, setIsLiking] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const fallbackImage = 'https://images.unsplash.com/photo-1579783483458-83d02161294e?w=800&q=80'

  useEffect(() => {
    setIsLiked(initialLiked)
    if (typeof artwork.likes === 'number') setLikesCount(artwork.likes)
  }, [initialLiked, artwork.likes])

  const requireAuth = (action: () => void) => {
    if (!getCurrentUser()) {
      setShowAuthPrompt(true)
      return
    }
    action()
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiking) return
    requireAuth(async () => {
      setIsLiking(true)
      const nextLiked = !isLiked
      if (onLike && typeof artwork.id === 'string') {
        await onLike(artwork.id, nextLiked)
        setIsLiked(nextLiked)
        setLikesCount(nextLiked ? likesCount + 1 : likesCount - 1)
      } else {
        setIsLiked(nextLiked)
        setLikesCount(nextLiked ? likesCount + 1 : likesCount - 1)
      }
      setIsLiking(false)
    })
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/gallery?artwork=${artwork.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: `Check out "${artwork.title}" by ${artwork.artist}`,
          url: shareUrl,
        })
      } catch (err) {
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
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

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onOpen) onOpen(artwork)
  }

  const handleCardClick = () => {
    if (onOpen) onOpen(artwork)
  }

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="group relative bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-amber-600/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(217,119,6,0.1)] hover:-translate-y-2 cursor-pointer"
      >
        {/* Aspect Ratio Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Luxury scaling and filtering */}
          <img
            src={artwork.image || fallbackImage}
            alt={artwork.title}
            className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = fallbackImage;
            }}
          />
          
          {/* Subtle Permanent Overlay for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

          {/* Action Row - Permanently Visible for Accessibility */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all shadow-2xl backdrop-blur-md border ${
                isLiked 
                  ? 'bg-amber-600/20 text-amber-600 border-amber-600/40' 
                  : 'bg-black/40 text-neutral-400 border-white/10 hover:bg-black/60'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="h-11 w-11 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all flex items-center justify-center shadow-2xl"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleDownload}
              className="h-11 w-11 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all flex items-center justify-center shadow-2xl"
            >
              <Download size={18} />
            </button>
          </div>

          {/* Floating Plaque Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-8 z-10 space-y-4">
             {/* Stronger glass overlay for high-contrast visibility */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent -z-10" />
             
             <div className="space-y-1 relative">
                <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  {artwork.title}
                </h3>
                <p className="text-neutral-400 text-[10px] tracking-[0.2em] uppercase font-black opacity-80">
                   by {artwork.artist}
                </p>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="space-y-0.5">
                   <p className="text-xl font-medium text-amber-600">₹{(artwork.price || 0).toLocaleString()}</p>
                   <p className="text-[8px] text-neutral-500 uppercase tracking-widest font-black">{artwork.category}</p>
                </div>
                
                <button
                  onClick={handleBuyClick}
                  className="px-6 py-2.5 rounded-2xl bg-white text-black hover:bg-neutral-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
                >
                  <ShoppingCart size={14} />
                  Acquire
                </button>
             </div>
          </div>
        </div>
      </div>

      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
    </>
  )
}
