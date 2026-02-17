'use client'

import { useEffect, useState } from 'react'

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isPWA = isStandalone || isInWebAppiOS

      setIsPWA(isPWA)
      setIsStandalone(isStandalone)

      // Add class to body for PWA-specific styling
      if (isPWA) {
        document.body.classList.add('pwa-mode')
      } else {
        document.body.classList.remove('pwa-mode')
      }
    }

    checkPWA()

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkPWA)

    return () => {
      mediaQuery.removeEventListener('change', checkPWA)
    }
  }, [])

  return { isPWA, isStandalone }
}