'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

export function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const checkPermission = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone === true

      if (isPWA && 'Notification' in window && Notification.permission === 'default') {
        setTimeout(() => setShowPrompt(true), 5000)
      }
    }

    checkPermission()
  }, [])

  const handleAllow = async () => {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      
      try {
        const vapidKey = 'BPaOdiaILDPWhKVh5aep1uB6oGi8I2WTdBj1VIaxxZicpLeWmHKUwaFmGNhsHfbW7baaOjfFJxXWZFHczhdndck'
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        })

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        })
      } catch (error) {
        console.error('Subscription failed:', error)
      }
    }
    
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4">
      <div className="bg-neutral-900 border border-amber-600/30 rounded-lg shadow-2xl p-4">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 text-neutral-500 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-amber-600/20 p-2 rounded-lg">
            <Bell className="text-amber-600" size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Enable Notifications</h3>
            <p className="text-neutral-400 text-sm mb-3">
              Stay updated with new exhibitions, artworks, and exclusive offers
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleAllow}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded transition-colors"
              >
                Allow
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
