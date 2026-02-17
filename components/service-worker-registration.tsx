'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('PWA: Service Worker registered successfully:', registration.scope)

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  console.log('PWA: New content is available and will be used when all tabs for this page are closed.')
                }
              })
            }
          })

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 1000 * 60 * 60) // Check every hour
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error)
        })

      // Handle controller change (when new SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Service Worker controller changed, reloading page...')
        window.location.reload()
      })
    } else {
      console.warn('PWA: Service Worker not supported in this browser')
    }
  }, [])

  return null
}