'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function NeonRing() {
  const [isMobile, setIsMobile] = useState(false)
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSPWA = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isIOSPWA)
    }
    
    checkMobile()
    checkPWA()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const ringSize = isMobile ? (isPWA ? '310px' : '290px') : '700px'
  const borderWidth = isMobile ? (isPWA ? '3px' : '4px') : '6px'
  const glowIntensity = isPWA ? {
    initial: '0 0 60px rgba(217, 119, 6, 0.8), 0 0 90px rgba(217, 119, 6, 0.6), inset 0 0 60px rgba(217, 119, 6, 0.4)',
    peak: '0 0 120px rgba(217, 119, 6, 1), 0 0 180px rgba(217, 119, 6, 0.9), inset 0 0 100px rgba(217, 119, 6, 0.7)',
  } : isMobile ? {
    initial: '0 0 40px rgba(217, 119, 6, 0.5), 0 0 60px rgba(217, 119, 6, 0.3), inset 0 0 40px rgba(217, 119, 6, 0.2)',
    peak: '0 0 60px rgba(217, 119, 6, 0.7), 0 0 90px rgba(217, 119, 6, 0.5), inset 0 0 60px rgba(217, 119, 6, 0.3)',
  } : {
    initial: '0 0 60px rgba(217, 119, 6, 0.6), 0 0 90px rgba(217, 119, 6, 0.4), inset 0 0 50px rgba(217, 119, 6, 0.25)',
    peak: '0 0 100px rgba(217, 119, 6, 0.9), 0 0 150px rgba(217, 119, 6, 0.7), inset 0 0 80px rgba(217, 119, 6, 0.5)',
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="absolute rounded-full will-change-transform"
        style={{
          width: ringSize,
          height: ringSize,
          borderWidth,
          borderStyle: 'solid',
          borderColor: 'rgba(217, 119, 6, 0.8)',
          boxShadow: isPWA || isMobile ? glowIntensity.initial : undefined
        }}
        animate={isPWA || isMobile ? {} : {
          scale: [1, 1.03, 1],
          opacity: [0.5, 1, 0.5],
          boxShadow: [
            glowIntensity.initial,
            glowIntensity.peak,
            glowIntensity.initial
          ]
        }}
        transition={isPWA || isMobile ? {} : {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
