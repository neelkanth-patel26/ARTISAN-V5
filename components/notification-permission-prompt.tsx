'use client'

import { useState, useEffect } from 'react'
import { Bell, MapPin, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { pushNotificationService } from '@/lib/push-notifications'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const user = getCurrentUser()

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    if (!user) return
    
    const notificationPermission = Notification.permission
    const isSubscribed = await pushNotificationService.isSubscribed(user.user_id)
    
    if (notificationPermission === 'default' && !isSubscribed) {
      setTimeout(() => setShow(true), 3000)
    }
  }

  const handleEnable = async () => {
    if (!user) {
      toast.error('Please login first')
      return
    }

    setRequesting(true)

    try {
      await pushNotificationService.subscribe(user.user_id)
      
      try {
        const position = await pushNotificationService.requestLocationPermission()
        await pushNotificationService.saveLocation(
          user.user_id,
          position.coords.latitude,
          position.coords.longitude
        )
        toast.success('Notifications and location enabled')
      } catch {
        toast.success('Notifications enabled')
      }

      setShow(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to enable notifications')
    } finally {
      setRequesting(false)
    }
  }

  if (!user) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-neutral-900 border border-amber-600/30 rounded-xl p-6 shadow-2xl">
            <button
              onClick={() => setShow(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center shrink-0">
                <Bell className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Stay Updated</h3>
                <p className="text-neutral-400 text-sm">
                  Get notified about new artworks, exhibitions, and exclusive offers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 text-xs text-neutral-500">
              <MapPin size={14} />
              <span>We'll also request location for personalized content</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                disabled={requesting}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {requesting ? 'Enabling...' : 'Enable'}
              </button>
              <button
                onClick={() => setShow(false)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-all"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
