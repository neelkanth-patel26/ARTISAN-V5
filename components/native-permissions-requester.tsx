'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { Geolocation } from '@capacitor/geolocation'

export function NativePermissionsRequester() {
    useEffect(() => {
        const requestPermissions = async () => {
            // Only run on native platforms (Android/iOS)
            if (Capacitor.isNativePlatform()) {
                try {
                    // 1. Request Push Notification permissions
                    const pushStatus = await PushNotifications.checkPermissions()
                    if (pushStatus.receive === 'prompt') {
                        await PushNotifications.requestPermissions()
                    }

                    // 2. Request Geolocation permissions
                    const geoStatus = await Geolocation.checkPermissions()
                    if (geoStatus.location === 'prompt' || geoStatus.coarseLocation === 'prompt') {
                        await Geolocation.requestPermissions()
                    }

                    // Note: File download permissions (Storage) are usually handled 
                    // at the moment of download or declared in Manifest, 
                    // but these two are the most common "first-open" prompts.
                } catch (error) {
                    console.error('Error requesting native permissions:', error)
                }
            }
        }

        // Delay slightly to ensure app is ready and avoid blocking splash transition
        const timer = setTimeout(requestPermissions, 3000)
        return () => clearTimeout(timer)
    }, [])

    return null
}
