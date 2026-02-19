'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

export default function TestNotificationPage() {
  const [status, setStatus] = useState('')

  const testNotification = async () => {
    setStatus('Testing...')

    // Check if service worker is registered
    if (!('serviceWorker' in navigator)) {
      setStatus('❌ Service Worker not supported')
      return
    }

    const registration = await navigator.serviceWorker.ready
    setStatus('✅ Service Worker ready')

    // Check notification permission
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('❌ Notification permission denied')
        return
      }
    }
    setStatus('✅ Notification permission granted')

    // Get subscription
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        })
        setStatus('✅ Push subscription created')
      } catch (error: any) {
        setStatus(`❌ Subscription failed: ${error.message}`)
        return
      }
    } else {
      setStatus('✅ Already subscribed')
    }

    // Send test notification
    try {
      await registration.showNotification('Test Notification', {
        body: 'This is a test notification from Artisan',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        requireInteraction: true
      })
      setStatus('✅ Test notification sent!')
    } catch (error: any) {
      setStatus(`❌ Failed to show notification: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-amber-600" size={32} />
          <h1 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Test Notifications
          </h1>
        </div>

        <button
          onClick={testNotification}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium transition-colors mb-4"
        >
          Send Test Notification
        </button>

        {status && (
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{status}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-neutral-500 space-y-2">
          <p>• Make sure you're in PWA mode (installed app)</p>
          <p>• Check browser console for errors</p>
          <p>• Verify VAPID keys are set in .env.local</p>
        </div>
      </div>
    </div>
  )
}
