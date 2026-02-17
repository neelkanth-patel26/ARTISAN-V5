'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function NeonRing() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="absolute rounded-full will-change-transform"
        style={{
          width: isMobile ? '350px' : '700px',
          height: isMobile ? '350px' : '700px',
          borderWidth: isMobile ? '4px' : '6px',
          borderStyle: 'solid',
          borderColor: 'rgba(217, 119, 6, 0.8)',
          boxShadow: isMobile 
            ? '0 0 40px rgba(217, 119, 6, 0.5), 0 0 60px rgba(217, 119, 6, 0.3), inset 0 0 40px rgba(217, 119, 6, 0.2)'
            : undefined
        }}
        animate={isMobile ? {} : {
          scale: [1, 1.03, 1],
          opacity: [0.5, 1, 0.5],
          boxShadow: [
            '0 0 60px rgba(217, 119, 6, 0.6), 0 0 90px rgba(217, 119, 6, 0.4), inset 0 0 50px rgba(217, 119, 6, 0.25)',
            '0 0 100px rgba(217, 119, 6, 0.9), 0 0 150px rgba(217, 119, 6, 0.7), inset 0 0 80px rgba(217, 119, 6, 0.5)',
            '0 0 60px rgba(217, 119, 6, 0.6), 0 0 90px rgba(217, 119, 6, 0.4), inset 0 0 50px rgba(217, 119, 6, 0.25)'
          ]
        }}
        transition={isMobile ? {} : {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
