import { sendNotificationToUser } from './push-notifications'

export const NOTIFICATION_MESSAGES = {
  PROFILE_INCOMPLETE: {
    title: '✨ Complete Your Profile',
    body: 'Add more details to your profile and stand out in the community!',
    icon: '/icon-192x192.png',
  },
  ARTWORK_UPLOADED: {
    title: '🎨 Artwork Uploaded Successfully',
    body: 'Thank you for sharing your art with our community!',
    icon: '/icon-192x192.png',
  },
  ARTWORK_PURCHASED: {
    title: '🎉 Purchase Successful',
    body: 'Thank you for supporting our artists!',
    icon: '/icon-192x192.png',
  },
  ARTIST_SUPPORT: {
    title: '❤️ Thank You',
    body: 'Thank you for supporting the artist community!',
    icon: '/icon-192x192.png',
  },
  NEW_ART_AVAILABLE: {
    title: '🖼️ New Art Awaits',
    body: 'Discover fresh artworks from talented artists!',
    icon: '/icon-192x192.png',
  },
  UPLOAD_STARTED: {
    title: '📤 Upload Started',
    body: 'Your artwork is being uploaded...',
    icon: '/icon-192x192.png',
  },
  UPLOAD_PROGRESS: {
    title: '⏳ Uploading',
    body: 'Upload in progress...',
    icon: '/icon-192x192.png',
  },
  UPLOAD_COMPLETE: {
    title: '✅ Upload Complete',
    body: 'Your artwork has been uploaded successfully!',
    icon: '/icon-192x192.png',
  },
}

export async function triggerNotification(type: keyof typeof NOTIFICATION_MESSAGES, customBody?: string) {
  const message = NOTIFICATION_MESSAGES[type]
  
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(message.title, {
        body: customBody || message.body,
        icon: message.icon,
        badge: '/icon-192x192.png',
        tag: type,
        requireInteraction: false,
      })
    } else {
      new Notification(message.title, {
        body: customBody || message.body,
        icon: message.icon,
      })
    }
  }
}

export async function showUploadProgress(progress: number, fileName: string) {
  const body = `${fileName} - ${progress}% complete`
  await triggerNotification('UPLOAD_PROGRESS', body)
}

export function scheduleRandomNotification() {
  const delay = Math.random() * 24 * 60 * 60 * 1000
  setTimeout(() => {
    triggerNotification('NEW_ART_AVAILABLE')
    scheduleRandomNotification()
  }, delay)
}
