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
        }
        a:active, button:active, [role="button"]:active {
          opacity: 0.7 !important;
        }
      `
      document.head.appendChild(style)

      // Add click event listener to ensure single-click navigation
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        const button = target.closest('button')
        
        if (link || button) {
          // Prevent any potential double-click issues
          e.stopPropagation()
        }
      }
      
      document.addEventListener('click', handleClick, { capture: true })
      
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
          document.removeEventListener('click', handleClick)
          document.removeEventListener('touchstart', handleTouchStart)
          document.removeEventListener('touchmove', handleTouchMove)
        }
      }

      return () => {
        document.removeEventListener('click', handleClick)
      }
    }
  }, [])

  return null
}