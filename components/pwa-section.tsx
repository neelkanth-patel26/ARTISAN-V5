'use client'

import { QrCode, Smartphone, Download, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'
import { motion } from 'framer-motion'

export function PWASection() {
  const [qrCode, setQrCode] = useState('')
  const [localUrl, setLocalUrl] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const loadPWA = async () => {
      try {
        let url = ''
        
        // Check if we're in production (Vercel) or development
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          // Production: Use the current origin (Vercel URL)
          url = window.location.origin
          console.log('PWA: Using production URL:', url)
        } else {
          // Development: Use local IP
          console.log('PWA: Using development mode')
          const res = await fetch('/api/local-ip')
          const data = await res.json()
          url = `http://${data.ip}:${data.port}`
          console.log('PWA: Local URL:', url)
        }
        
        setLocalUrl(url)
        const qr = await QRCodeLib.toDataURL(url, { width: 300, margin: 2 })
        setQrCode(qr)
        console.log('PWA: QR code generated successfully')
        setIsLoading(false)
      } catch (err) {
        console.error('PWA load error:', err)
        // Fallback: try to use current origin
        if (typeof window !== 'undefined') {
          try {
            const fallbackUrl = window.location.origin
            setLocalUrl(fallbackUrl)
            const qr = await QRCodeLib.toDataURL(fallbackUrl, { width: 300, margin: 2 })
            setQrCode(qr)
            console.log('PWA: Fallback QR generated for:', fallbackUrl)
          } catch (fallbackErr) {
            console.error('PWA fallback error:', fallbackErr)
          } finally {
            setIsLoading(false)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPWA()
    
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }
    
    window.addEventListener('beforeinstallprompt', handler, { passive: true })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  if (!isMounted) {
    return (
      <div className="relative hidden lg:flex h-screen w-full items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-800 rounded w-64 mb-4"></div>
          <div className="h-4 bg-neutral-800 rounded w-96 mb-8"></div>
          <div className="h-32 bg-neutral-800 rounded w-32"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative hidden lg:flex h-screen w-full items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      
      <div className="max-w-7xl mx-auto px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 text-amber-500/60 text-[9px] tracking-[0.5em] font-black uppercase mb-6">
                <Zap size={12} className="text-amber-500" />
                Connectivity
              </div>
              
              <h2 
                className="text-5xl lg:text-6xl font-light tracking-tight text-white/90 mb-6"
                style={{ fontFamily: 'ForestSmooth, serif' }}
              >
                Install Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">App</span>
              </h2>
              
              <p className="text-neutral-400 text-base font-light leading-relaxed mb-8">
                <strong>QR Code = Browser View</strong><br />
                Scan for quick access, but install the PWA for <strong>true fullscreen native app experience</strong> with black status bar.
              </p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-4 hover:translate-x-1 transition-transform cursor-default">
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-amber-600/40 text-[10px] font-black tracking-widest flex-shrink-0">01</div>
                <div>
                  <h3 className="text-neutral-500 text-[10px] tracking-[0.3em] font-black uppercase mb-1">Scan Art Matrix</h3>
                  <p className="text-neutral-400 text-xs font-light">Open your vision device and point it at the genesis code</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 hover:translate-x-1 transition-transform cursor-default">
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-amber-600/40 text-[10px] font-black tracking-widest flex-shrink-0">02</div>
                <div>
                  <h3 className="text-neutral-500 text-[10px] tracking-[0.3em] font-black uppercase mb-1">Initiate Interface</h3>
                  <p className="text-neutral-400 text-xs font-light">Select "Add to Home Screen" for a seamless terminal experience</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 hover:translate-x-1 transition-transform cursor-default">
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-amber-600/40 text-[10px] font-black tracking-widest flex-shrink-0">03</div>
                <div>
                  <h3 className="text-neutral-500 text-[10px] tracking-[0.3em] font-black uppercase mb-1">Persistent Link</h3>
                  <p className="text-neutral-400 text-xs font-light">Direct sanctuary access with full offline autonomy</p>
                </div>
              </div>
            </motion.div>

            {showInstallButton && (
              <motion.button
                onClick={handleInstall}
                className="px-10 py-5 bg-white/5 border border-white/5 text-white/90 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-white/10 hover:border-white/10 transition-all duration-500 flex items-center gap-3 rounded-xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={14} />
                Manifest Locally
              </motion.button>
            )}

            <motion.div
              className="flex items-center gap-3 pt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Smartphone size={16} strokeWidth={1.5} className="text-amber-600/50" />
              <span className="text-neutral-500 text-xs font-light">Compatible with iOS & Android devices</span>
            </motion.div>
          </div>

          {/* Right QR Code */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {qrCode ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/50 to-transparent blur-3xl opacity-60" />
                <div className="relative bg-white p-10 rounded-[2rem] shadow-2xl border border-white/10 group-hover:border-white/20 transition-all duration-700 group-hover:shadow-white/5" style={{ transform: 'translateZ(0)' }}>
                  <img 
                    src={qrCode}
                    alt="Scan to install PWA"
                    className="w-64 h-64 grayscale contrast-125"
                    loading="lazy"
                  />
                  <div className="absolute inset-6 border-[3px] border-neutral-900/5 rounded-2xl pointer-events-none" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/5 rounded-full px-8 py-3 shadow-2xl">
                  <p className="text-neutral-400 text-[9px] font-black tracking-[0.5em] uppercase whitespace-nowrap">Scan Matrix</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center w-64 h-64 bg-neutral-800/50 rounded-2xl">
                <div className="text-amber-600/70 text-sm">Generating QR Code...</div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-neutral-800/50 rounded-2xl">
                <div className="text-red-400/70 text-sm">Failed to load QR Code</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PWASection
