'use client'

import { useEffect } from 'react'

export function PWAFullscreenManager() {
  useEffect(() => {
    // Check if we're in a PWA environment
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true

    if (isPWA) {
      // Set theme color for status bar
      const setThemeColor = (color: string) => {
        // Update existing meta theme-color tag
        let metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (!metaThemeColor) {
          metaThemeColor = document.createElement('meta')
          metaThemeColor.setAttribute('name', 'theme-color')
          document.head.appendChild(metaThemeColor)
        }
        metaThemeColor.setAttribute('content', color)

        // Also set apple status bar style
        let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        if (!appleStatusBar) {
          appleStatusBar = document.createElement('meta')
          appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
          document.head.appendChild(appleStatusBar)
        }
        appleStatusBar.setAttribute('content', 'default')
      }

      // Set the orange/amber theme color
      setThemeColor('#d97706')

      // Attempt to enter fullscreen if supported
      const enterFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen()
          } else if ((document.documentElement as any).webkitRequestFullscreen) {
            await (document.documentElement as any).webkitRequestFullscreen()
          } else if ((document.documentElement as any).mozRequestFullScreen) {
            await (document.documentElement as any).mozRequestFullScreen()
          } else if ((document.documentElement as any).msRequestFullscreen) {
            await (document.documentElement as any).msRequestFullscreen()
          }
        } catch (error) {
          console.log('Fullscreen not available or denied:', error)
        }
      }

      // Only attempt fullscreen on user interaction (browsers require this)
      const handleUserInteraction = () => {
        enterFullscreen()
        // Remove listeners after first interaction
        document.removeEventListener('touchstart', handleUserInteraction)
        document.removeEventListener('click', handleUserInteraction)
      }

      // Add listeners for user interaction to enable fullscreen
      document.addEventListener('touchstart', handleUserInteraction, { once: true })
      document.addEventListener('click', handleUserInteraction, { once: true })

      // Force body to take full height
      document.body.style.height = '100vh'
      document.body.style.height = '100dvh' // Dynamic viewport height
      document.documentElement.style.height = '100vh'
      document.documentElement.style.height = '100dvh'

      console.log('PWA: Fullscreen manager initialized')
    }
  }, [])

  return null
}