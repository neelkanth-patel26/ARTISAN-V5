'use client'

import { useEffect } from 'react'

export function PWAFullscreenManager() {
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true

    const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent)

    if (isPWA) {
      if (isAndroidChrome) {
        const setAndroidThemeColor = () => {
          const existingThemeColors = document.querySelectorAll('meta[name="theme-color"]')
          existingThemeColors.forEach(tag => tag.remove())

          const themeColorMeta = document.createElement('meta')
          themeColorMeta.name = 'theme-color'
          themeColorMeta.content = '#000000'
          document.head.appendChild(themeColorMeta)

          const androidStatusBarMeta = document.createElement('meta')
          androidStatusBarMeta.name = 'color'
          androidStatusBarMeta.content = '#000000'
          document.head.appendChild(androidStatusBarMeta)
        }

        setAndroidThemeColor()

        let backButtonPressed = false
        const handleBackButton = (event: PopStateEvent) => {
          if (!backButtonPressed) {
            backButtonPressed = true
            if (window.confirm('Exit Artisan?')) {
              window.close()
            } else {
              window.history.pushState(null, '', window.location.href)
            }
            setTimeout(() => {
              backButtonPressed = false
            }, 1000)
          }
        }

        window.addEventListener('popstate', handleBackButton)

        let startY = 0
        let isScrolling = false
        const handleTouchStart = (e: TouchEvent) => {
          const target = e.target as HTMLElement
          if (target.closest('button, a, input, textarea, select')) {
            return
          }
          startY = e.touches[0].clientY
          isScrolling = false
        }

        const handleTouchMove = (e: TouchEvent) => {
          const target = e.target as HTMLElement
          if (target.closest('button, a, input, textarea, select')) {
            return
          }
          const currentY = e.touches[0].clientY
          const diffY = currentY - startY
          isScrolling = true
          if (diffY > 0 && window.scrollY === 0) {
            e.preventDefault()
          }
        }

        document.addEventListener('touchstart', handleTouchStart, { passive: true })
        document.addEventListener('touchmove', handleTouchMove, { passive: false })

        const handleResize = () => {
          const viewportHeight = window.innerHeight
          document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`)
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
          window.removeEventListener('popstate', handleBackButton)
          window.removeEventListener('resize', handleResize)
          document.removeEventListener('touchstart', handleTouchStart)
          document.removeEventListener('touchmove', handleTouchMove)
        }
      }

      const setThemeColor = (color: string) => {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (!metaThemeColor) {
          metaThemeColor = document.createElement('meta')
          metaThemeColor.setAttribute('name', 'theme-color')
          document.head.appendChild(metaThemeColor)
        }
        metaThemeColor.setAttribute('content', color)

        let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        if (!appleStatusBar) {
          appleStatusBar = document.createElement('meta')
          appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
          document.head.appendChild(appleStatusBar)
        }
        appleStatusBar.setAttribute('content', 'default')
      }

      setThemeColor('#000000')
    }
  }, [])

  return null
}