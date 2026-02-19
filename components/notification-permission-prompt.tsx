'use client'

import { useState, useEffect } from 'react'
import { Bell, MapPin, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { pushNotificationService } from '@/lib/push-notifications'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [step, setStep] = useState<'notification' | 'location'>('notification')
  const user = getCurrentUser()

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    if (!user) return
    
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return
    }
    
    const notificationPermission = Notification.permission
    
    if (notificationPermission === 'denied') {
      return
    }
    
    if (notificationPermission === 'granted') {
      const isSubscribed = await pushNotificationService.isSubscribed(user.user_id)
      if (!isSubscribed) {
        setTimeout(() => setShow(true), 3000)
      }
      return
    }
    
    if (notificationPermission === 'default') {
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
      // Request notification permission and subscribe
      await pushNotificationService.subscribe(user.user_id)
      
      // Test notification
      await pushNotificationService.testNotification(
        'Notifications Enabled! 🎉',
        'You will now receive updates about exhibitions and artworks'
      )
      
      toast.success('Notifications enabled successfully')
      
      // Ask for location
      setStep('location')
      setRequesting(false)
    } catch (error: any) {
      console.error('Notification error:', error)
      toast.error(error.message || 'Failed to enable notifications')
      setRequesting(false)
      setShow(false)
    }
  }

  const handleLocationEnable = async () => {
    if (!user) return

    setRequesting(true)

    try {
      const position = await pushNotificationService.requestLocationPermission()
      await pushNotificationService.saveLocation(
        user.user_id,
        position.coords.latitude,
        position.coords.longitude
      )
      toast.success('Location enabled for personalized content')
      setShow(false)
    } catch (error: any) {
      console.error('Location error:', error)
      toast.info('You can enable location later in settings')
      setShow(false)
    } finally {
      setRequesting(false)
    }
  }

  const handleSkipLocation = () => {
    setShow(false)
    toast.info('You can enable location later in settings')
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
              className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {step === 'notification' ? (
              <>
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

                <div className="flex gap-2">
                  <button
                    onClick={handleEnable}
                    disabled={requesting}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requesting ? 'Enabling...' : 'Enable Notifications'}
                  </button>
                  <button
                    onClick={() => setShow(false)}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-all"
                  >
                    Later
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center shrink-0">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="text-green-500" size={16} />
                      <h3 className="text-white font-medium">Notifications Enabled!</h3>
                    </div>
                    <p className="text-neutral-400 text-sm">
                      Enable location for personalized exhibition recommendations near you
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleLocationEnable}
                    disabled={requesting}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requesting ? 'Enabling...' : 'Enable Location'}
                  </button>
                  <button
                    onClick={handleSkipLocation}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-all"
                  >
                    Skip
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
