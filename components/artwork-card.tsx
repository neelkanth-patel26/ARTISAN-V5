'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { Heart, Share2, Download, ShoppingCart } from 'lucide-react'
import { ArtworkModal } from './artwork-modal'
import { AuthPromptModal } from './auth-prompt-modal'

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
}

export function ArtworkCard({ artwork, initialLiked = false, onLike }: ArtworkCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(artwork.likes ?? 0)
  const [isLiking, setIsLiking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

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
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      // Show a simple toast notification
      const toast = document.createElement('div')
      toast.textContent = 'Link copied to clipboard!'
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#d97706;color:white;padding:12px 24px;border-radius:8px;z-index:9999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3)'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 2000)
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    requireAuth(() => {
      const link = document.createElement('a')
      link.href = artwork.image
      link.download = `${artwork.title}.jpg`
      link.click()
    })
  }

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    requireAuth(() => setShowModal(true))
  }

  const handleImageClick = () => {
    if (!getCurrentUser()) {
      if (typeof window !== 'undefined' && typeof artwork.id === 'string') {
        localStorage.setItem('auth_redirect', `/gallery?artwork=${artwork.id}`)
      }
      setShowAuthPrompt(true)
    } else {
      setShowModal(true)
    }
  }

  return (
    <>
      <div className="group relative bg-neutral-900/50 border border-neutral-700/50 rounded-xl overflow-hidden hover:border-amber-600/50 transition-all hover:shadow-2xl hover:shadow-amber-600/10 hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={handleImageClick}>
          <img
            src={artwork.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-light text-xl mb-1" style={{ fontFamily: 'CaviarDreams, sans-serif' }}>{artwork.title}</h3>
            <p className="text-neutral-300 text-sm font-light">by {artwork.artist}</p>
          </div>
        </div>

        <div className="p-5">
          {(artwork as any).description && (
            <p className="text-neutral-400 text-xs font-light mb-3 line-clamp-2">{(artwork as any).description}</p>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-amber-600/90 font-light text-2xl">₹{artwork.price}</span>
            <span className="text-xs text-neutral-600 uppercase tracking-wider font-light px-2 py-1 bg-neutral-800/50 rounded-full">{artwork.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all font-light disabled:opacity-50 disabled:cursor-not-allowed ${
                isLiked ? 'bg-amber-600/20 text-amber-600 border border-amber-600/30' : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 border border-transparent'
              }`}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
              {likesCount}
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
            >
              <Share2 size={14} />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
            >
              <Download size={14} />
            </button>

            <button
              onClick={handleBuyClick}
              className="ml-auto px-4 py-2 rounded-lg bg-amber-600/90 border border-amber-600 text-white hover:bg-amber-600 transition-all text-xs font-light"
            >
              <ShoppingCart size={14} className="inline mr-1" />
              Buy
            </button>
          </div>
        </div>
      </div>

      {showModal && <ArtworkModal artwork={artwork} onClose={() => setShowModal(false)} onShowAuthPrompt={() => { setShowModal(false); setShowAuthPrompt(true) }} />}
      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
    </>
  )
}
