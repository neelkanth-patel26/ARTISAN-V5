'use client'

import { useEffect } from 'react'

export function PWAFullscreenManager() {
  useEffect(() => {
    // Check if we're in a PWA environment
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true

    // Detect Android Chrome specifically
    const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent)

    if (isPWA) {
      // Android Chrome specific handling
      if (isAndroidChrome) {
        console.log('PWA: Android Chrome detected, applying Chrome-specific optimizations')

        // Force status bar theming for Android Chrome
        const setAndroidThemeColor = () => {
          // Remove any existing theme-color meta tags
          const existingThemeColors = document.querySelectorAll('meta[name="theme-color"]')
          existingThemeColors.forEach(tag => tag.remove())

          // Create new theme-color meta tag specifically for Android
          const themeColorMeta = document.createElement('meta')
          themeColorMeta.name = 'theme-color'
          themeColorMeta.content = '#000000'
          document.head.appendChild(themeColorMeta)

          // Also set color for Android status bar
          const androidStatusBarMeta = document.createElement('meta')
          androidStatusBarMeta.name = 'color'
          androidStatusBarMeta.content = '#000000'
          document.head.appendChild(androidStatusBarMeta)

          // Force repaint to apply theme
          document.body.style.backgroundColor = '#000000'
          setTimeout(() => {
            document.body.style.backgroundColor = ''
          }, 100)
        }

        setAndroidThemeColor()

        // Handle Android back button
        let backButtonPressed = false
        const handleBackButton = (event: PopStateEvent) => {
          if (!backButtonPressed) {
            backButtonPressed = true
            // Show exit confirmation or navigate to home
            if (window.confirm('Exit Artisan?')) {
              // Close PWA
              window.close()
            } else {
              // Stay in app
              window.history.pushState(null, '', window.location.href)
            }
            setTimeout(() => {
              backButtonPressed = false
            }, 1000)
          }
        }

        // Add back button listener
        window.addEventListener('popstate', handleBackButton)

        // Prevent pull-to-refresh on Android Chrome (only prevent when actually pulling down from top)
        let startY = 0
        const handleTouchStart = (e: TouchEvent) => {
          startY = e.touches[0].clientY
        }

        const handleTouchMove = (e: TouchEvent) => {
          const currentY = e.touches[0].clientY
          const diffY = startY - currentY

          // Only prevent pull-to-refresh if actually pulling down from very top and scrolling up
          if (diffY > 0 && window.scrollY <= 5 && startY < 50) {
            e.preventDefault()
          }
        }

        document.addEventListener('touchstart', handleTouchStart, { passive: false })
        document.addEventListener('touchmove', handleTouchMove, { passive: false })

        // Handle Android gesture navigation conflicts
        const handleResize = () => {
          // Adjust for Android gesture navigation
          const viewportHeight = window.innerHeight
          document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`)
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        // Cleanup function
        return () => {
          window.removeEventListener('popstate', handleBackButton)
          window.removeEventListener('resize', handleResize)
          document.removeEventListener('touchstart', handleTouchStart)
          document.removeEventListener('touchmove', handleTouchMove)
        }
      }

      // General PWA theming (works for all platforms)
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

      // Set the black theme color
      setThemeColor('#000000')

      console.log('PWA: Fullscreen manager initialized', { isAndroidChrome })
    }
  }, [])

  return null
}