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

  useEffect(() => {
    const loadPWA = async () => {
      try {
        let url = ''
        
        // Check if we're in production (Vercel) or development
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          // Production: Use the current origin (Vercel URL)
          url = window.location.origin
        } else {
          // Development: Use local IP
          const res = await fetch('/api/local-ip')
          const data = await res.json()
          url = `http://${data.ip}:${data.port}`
        }
        
        setLocalUrl(url)
        const qr = await QRCodeLib.toDataURL(url, { width: 300, margin: 2 })
        setQrCode(qr)
      } catch (err) {
        console.error('PWA load error:', err)
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
              <div className="flex items-center gap-2 text-amber-600/70 text-xs tracking-[0.3em] font-light mb-6">
                <Zap size={14} strokeWidth={1.5} />
                MOBILE ACCESS
              </div>
              
              <h2 
                className="text-5xl lg:text-6xl font-light tracking-tight text-white/90 mb-6"
                style={{ fontFamily: 'ForestSmooth, serif' }}
              >
                Install Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">App</span>
              </h2>
              
              <p className="text-neutral-400 text-base font-light leading-relaxed mb-8">
                Experience Artisan on the go. Scan the QR code to install our progressive web app on your mobile device and access it anytime.
              </p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full border border-amber-600/30 flex items-center justify-center text-amber-600/70 text-sm font-light flex-shrink-0">1</div>
                <div>
                  <h3 className="text-white/80 font-light mb-1">Scan QR Code</h3>
                  <p className="text-neutral-500 text-sm font-light">Open your phone camera and point it at the QR code</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full border border-amber-600/30 flex items-center justify-center text-amber-600/70 text-sm font-light flex-shrink-0">2</div>
                <div>
                  <h3 className="text-white/80 font-light mb-1">Add to Home Screen</h3>
                  <p className="text-neutral-500 text-sm font-light">Tap the notification and select "Add to Home Screen"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full border border-amber-600/30 flex items-center justify-center text-amber-600/70 text-sm font-light flex-shrink-0">3</div>
                <div>
                  <h3 className="text-white/80 font-light mb-1">Enjoy Offline Access</h3>
                  <p className="text-neutral-500 text-sm font-light">Works like a native app with offline capabilities</p>
                </div>
              </div>
            </motion.div>

            {showInstallButton && (
              <motion.button
                onClick={handleInstall}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-600/50 text-amber-600 rounded-sm flex items-center gap-2 transition-all hover:from-amber-600/30 hover:to-amber-500/30 hover:border-amber-600/70 text-sm tracking-wider font-light shadow-lg shadow-amber-600/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} strokeWidth={1.5} />
                INSTALL NOW
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
            {qrCode && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent blur-3xl opacity-50" />
                <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-neutral-800/30 group-hover:border-amber-600/30 transition-all duration-300" style={{ transform: 'translateZ(0)' }}>
                  <img 
                    src={qrCode}
                    alt="Scan to install PWA"
                    className="w-64 h-64"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800/50 rounded-lg px-4 py-2">
                  <p className="text-amber-600/70 text-xs font-light tracking-wider whitespace-nowrap">SCAN TO INSTALL</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
