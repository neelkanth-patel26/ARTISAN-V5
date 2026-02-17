'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, Facebook, Twitter, Linkedin, Mail, Link2, Check, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ShareModalProps {
  title: string
  description?: string
  url: string
  imageUrl?: string
  onClose: () => void
}

export function ShareModal({ title, description, url, imageUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

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

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareToTwitter = () => {
    const text = `${title}${description ? ` - ${description}` : ''}`
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareToWhatsApp = () => {
    const text = `${title}${description ? ` - ${description}` : ''} ${shareUrl}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    )
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${description || ''}\n\n${shareUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  }

  const platforms = [
    { name: 'Facebook', icon: Facebook, action: shareToFacebook, color: 'hover:bg-blue-600' },
    { name: 'Twitter', icon: Twitter, action: shareToTwitter, color: 'hover:bg-sky-500' },
    { name: 'LinkedIn', icon: Linkedin, action: shareToLinkedIn, color: 'hover:bg-blue-700' },
    { name: 'WhatsApp', icon: MessageCircle, action: shareToWhatsApp, color: 'hover:bg-green-600' },
    { name: 'Email', icon: Mail, action: shareViaEmail, color: 'hover:bg-neutral-600' }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-950 border border-amber-600/30 rounded-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Share2 size={20} className="text-amber-600" />
              <h2 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Share
              </h2>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Preview */}
            {imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-neutral-900">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <h3 className="text-white font-medium mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-neutral-400">{description}</p>
              )}
            </div>

            {/* Social Platforms */}
            <div className="grid grid-cols-5 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={platform.action}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg bg-neutral-900 border border-neutral-800 ${platform.color} hover:border-transparent transition-all group`}
                  title={platform.name}
                >
                  <platform.icon size={24} className="text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="text-xs text-neutral-500 group-hover:text-white transition-colors">{platform.name}</span>
                </button>
              ))}
            </div>

            {/* Copy Link */}
            <div className="space-y-2">
              <label className="block text-sm text-neutral-400">Or copy link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Link2 size={18} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Native Share (Mobile) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={shareNative}
                className="w-full py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-amber-600/50 transition-all"
              >
                More sharing options
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
