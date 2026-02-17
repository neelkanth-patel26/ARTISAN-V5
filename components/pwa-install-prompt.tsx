'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    // Check if already in standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      const iosStandalone = (window.navigator as any).standalone === true
      const isInStandalone = standalone || iosStandalone

      setIsStandalone(isInStandalone)
      setDebugInfo(`Standalone: ${isInStandalone}, Display mode: ${window.matchMedia('(display-mode: standalone)').matches}, iOS standalone: ${(window.navigator as any).standalone}`)

      console.log('PWA Debug:', {
        standalone,
        iosStandalone,
        userAgent: navigator.userAgent,
        displayMode: window.matchMedia('(display-mode: standalone)').matches
      })
    }

    checkStandalone()

    const handler = (e: any) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => {
        if (!isStandalone) {
          setShowPrompt(true)
        }
      }, 3000) // Reduced delay for testing
    }

    window.addEventListener('beforeinstallprompt', handler, { passive: true })

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      mediaQuery.removeEventListener('change', checkStandalone)
    }
  }, [isStandalone])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-neutral-900 border border-amber-600/30 rounded-lg shadow-2xl p-4" style={{ transform: 'translateZ(0)' }}>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-neutral-500 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-amber-600/20 p-2 rounded-lg">
            <Download className="text-amber-600" size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Install Artisan App</h3>
            <p className="text-neutral-400 text-sm mb-3">
              Get fullscreen experience without browser UI
            </p>

            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-amber-400/70 mb-2 p-2 bg-amber-900/20 rounded">
                Debug: {debugInfo}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
