'use client'

import { useEffect } from 'react'
import { scheduleRandomNotification, triggerNotification } from '@/lib/notification-triggers'
import { getCurrentUser, getProfile } from '@/lib/auth'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('PWA: Service Worker registered')

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
      
      // Check profile completion
      setTimeout(async () => {
        const user = getCurrentUser()
        if (user?.user_id) {
          const profile = await getProfile(user.user_id)
          if (profile && (!profile.bio || !profile.phone || !profile.location)) {
            triggerNotification('PROFILE_INCOMPLETE')
          }
        }
      }, 5000)
      
      // Start random notifications
      if (Notification.permission === 'granted') {
        scheduleRandomNotification()
      }
    }
  }, [])

  return null
}