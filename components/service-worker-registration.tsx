'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(async (registration) => {
          console.log('PWA: Service Worker registered')

          // Wait for service worker to be active
          await navigator.serviceWorker.ready

          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            console.log('Notification permission:', permission)
          }

          // Subscribe to push notifications
          if ('PushManager' in window && Notification.permission === 'granted') {
            try {
              // Check for existing subscription first
              let subscription = await registration.pushManager.getSubscription()
              
              if (!subscription) {
                const vapidKey = 'BPaOdiaILDPWhKVh5aep1uB6oGi8I2WTdBj1VIaxxZicpLeWmHKUwaFmGNhsHfbW7baaOjfFJxXWZFHczhdndck'
                
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: vapidKey
                })

                // Send subscription to server
                await fetch('/api/notifications/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(subscription)
                })

                console.log('Push subscription successful')
              }
            } catch (error) {
              console.error('Push subscription failed:', error)
            }
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('PWA: New content available')
                }
              })
            }
          })

          setInterval(() => registration.update(), 1000 * 60 * 60)
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error)
        })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }, [])

  return null
}