'use client'

import { useState, useEffect } from 'react'
import { Bell, Send, Check, X, RefreshCw } from 'lucide-react'
import { pushNotificationService } from '@/lib/push-notifications'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

export default function NotificationTestPage() {
  const [user, setUser] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    checkStatus()
  }, [])

  const checkStatus = async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    
    const currentUser = getCurrentUser()
    if (currentUser) {
      const subscribed = await pushNotificationService.isSubscribed(currentUser.user_id)
      setIsSubscribed(subscribed)
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    try {
      await pushNotificationService.subscribe(user.user_id)
      await checkStatus()
      toast.success('Subscribed successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!user) return

    setLoading(true)
    try {
      await pushNotificationService.unsubscribe(user.user_id)
      await checkStatus()
      toast.success('Unsubscribed successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestLocal = async () => {
    try {
      await pushNotificationService.testNotification(
        'Test Notification 🎨',
        'This is a local test notification from Artisan'
      )
      toast.success('Local notification sent!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getPermissionColor = () => {
    switch (permission) {
      case 'granted': return 'text-green-500'
      case 'denied': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted': return <Check size={20} />
      case 'denied': return <X size={20} />
      default: return <Bell size={20} />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-2" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Push Notification Test
          </h1>
          <p className="text-neutral-400">Developer testing page</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-light mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>Status</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">User:</span>
              <span className={user ? 'text-green-500' : 'text-red-500'}>
                {user ? '✓ Logged In' : '✗ Not Logged In'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Permission:</span>
              <span className={`flex items-center gap-2 ${getPermissionColor()}`}>
                {getPermissionIcon()}
                {permission}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Subscription:</span>
              <span className={isSubscribed ? 'text-green-500' : 'text-red-500'}>
                {isSubscribed ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
          </div>

          <button
            onClick={checkStatus}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-lg transition-all"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-light mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>Actions</h2>
          
          <div className="space-y-3">
            {!isSubscribed ? (
              <button
                onClick={handleSubscribe}
                disabled={loading || !user}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                <Bell size={18} />
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            ) : (
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                <X size={18} />
                {loading ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
            )}

            <button
              onClick={handleTestLocal}
              disabled={permission !== 'granted'}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              <Bell size={18} />
              Test Local Notification
            </button>
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="text-amber-600 hover:text-amber-500">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}
