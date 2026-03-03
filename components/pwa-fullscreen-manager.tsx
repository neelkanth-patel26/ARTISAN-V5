'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

export function PWAFullscreenManager() {
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true

    if (isPWA) {
      document.body.classList.add('pwa-mode')
      
      const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent)

      if (isAndroidChrome) {
        const themeColorMeta = document.createElement('meta')
        themeColorMeta.name = 'theme-color'
        themeColorMeta.content = '#000000'
        document.head.appendChild(themeColorMeta)
      }
    }

    // Detect native platform (APK) and add class for conditional styling
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('native-mode')
    }
  }, [])

  return null
}