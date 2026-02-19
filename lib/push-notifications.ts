'use client'

import { supabase } from './supabase'

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  image?: string
  url?: string
  data?: any
}

class PushNotificationService {
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }
    
    if (Notification.permission === 'granted') {
      return 'granted'
    }
    
    if (Notification.permission === 'denied') {
      throw new Error('Notification permission denied')
    }
    
    return await Notification.requestPermission()
  }

  async requestLocationPermission(): Promise<GeolocationPosition | null> {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation not supported')
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  async saveLocation(userId: string, latitude: number, longitude: number): Promise<void> {
    await supabase
      .from('users')
      .update({
        latitude,
        longitude,
        location_updated_at: new Date().toISOString(),
        location_permission_granted: true
      })
      .eq('id', userId)
  }

  async subscribe(userId: string): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported')
    }

    if (!this.vapidPublicKey) {
      throw new Error('VAPID public key not configured')
    }

    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission denied')
    }

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription()
    
    // Only create new subscription if none exists
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })
    }

    const subscriptionData = subscription.toJSON()
    const deviceType = this.getDeviceType()

    // Save to database
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscriptionData.endpoint!,
      p256dh: subscriptionData.keys!.p256dh!,
      auth: subscriptionData.keys!.auth!,
      device_type: deviceType,
      user_agent: navigator.userAgent,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,endpoint'
    })

    if (error) throw error
  }

  async unsubscribe(userId: string): Promise<void> {
    if (!('serviceWorker' in navigator)) return

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint)
    }
  }

  async isSubscribed(userId: string): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (!subscription) return false

      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint)
        .eq('is_active', true)
        .single()

      return !!data
    } catch {
      return false
    }
  }

  async testNotification(title: string, body: string): Promise<void> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200]
    })
  }

  private getDeviceType(): 'android' | 'ios' | 'desktop' | 'other' {
    const ua = navigator.userAgent.toLowerCase()
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    
    if (/android/.test(ua)) return 'android'
    if (/iphone|ipad|ipod/.test(ua)) return 'ios'
    if (/windows|mac|linux/.test(ua) && !isStandalone) return 'desktop'
    return 'other'
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

export const pushNotificationService = new PushNotificationService()
