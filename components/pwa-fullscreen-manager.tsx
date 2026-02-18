'use client'

import { useEffect } from 'react'

export function PWAFullscreenManager() {
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true

    if (isPWA) {
      document.body.classList.add('pwa-mode')
      
      // Remove 300ms delay and improve click responsiveness
      const style = document.createElement('style')
      style.textContent = `
        * { 
          -webkit-tap-highlight-color: rgba(0,0,0,0) !important; 
          -webkit-touch-callout: none !important;
        }
        a, button, input, select, textarea, [role="button"] { 
          touch-action: manipulation !important; 
          cursor: pointer !important;
          -webkit-user-select: none !important;
        }
        button, a, [role="button"] {
          pointer-events: auto !important;
        }
        button *, a *, [role="button"] * {
          pointer-events: none !important;
        }
      `
      document.head.appendChild(style)

      // Force immediate click response
      const handleTouchEnd = (e: TouchEvent) => {
        const target = e.target as HTMLElement
        const button = target.closest('button')
        const link = target.closest('a')
        
        if (button && !button.disabled) {
          e.preventDefault()
          button.click()
        } else if (link) {
          e.preventDefault()
          link.click()
        }
      }
      
      document.addEventListener('touchend', handleTouchEnd, { passive: false })
      
      const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent)

      if (isAndroidChrome) {
        const setAndroidThemeColor = () => {
          const existingThemeColors = document.querySelectorAll('meta[name="theme-color"]')
          existingThemeColors.forEach(tag => tag.remove())

          const themeColorMeta = document.createElement('meta')
          themeColorMeta.name = 'theme-color'
          themeColorMeta.content = '#000000'
          document.head.appendChild(themeColorMeta)
        }

        setAndroidThemeColor()

        let startY = 0
        const handleTouchStart = (e: TouchEvent) => {
          startY = e.touches[0].clientY
        }

        const handleTouchMove = (e: TouchEvent) => {
          const currentY = e.touches[0].clientY
          const diffY = currentY - startY
          if (diffY > 0 && window.scrollY === 0) {
            e.preventDefault()
          }
        }

        document.addEventListener('touchstart', handleTouchStart, { passive: true })
        document.addEventListener('touchmove', handleTouchMove, { passive: false })

        return () => {
          document.removeEventListener('touchend', handleTouchEnd)
          document.removeEventListener('touchstart', handleTouchStart)
          document.removeEventListener('touchmove', handleTouchMove)
        }
      }

      return () => {
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [])

  return null
}