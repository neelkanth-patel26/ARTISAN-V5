const CACHE_NAME = 'artisan-v3'
const OFFLINE_URL = '/offline.html'

// Cache all essential resources
const STATIC_CACHE_URLS = [
  '/',
  '/about',
  '/exhibitions',
  '/visit',
  '/gallery',
  '/login',
  '/signup',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'
]

const API_CACHE_NAME = 'artisan-api-v1'

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets')
      return cache.addAll(STATIC_CACHE_URLS)
    }).then(() => {
      self.skipWaiting()
      console.log('Service Worker: Installation complete')
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      self.clients.claim()
      console.log('Service Worker: Activation complete')
    })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip caching for HEAD requests
  if (request.method === 'HEAD') {
    event.respondWith(fetch(request))
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone()
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => caches.match(OFFLINE_URL) || caches.match('/'))
    )
    return
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) return response

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
      })
      .catch(() => {
        if (request.destination === 'document') {
          return caches.match(OFFLINE_URL)
        }
      })
  )
})

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered')
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Service Worker: Performing background sync')
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event)
  
  let data = { title: 'Artisan', body: 'New notification' }
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      console.error('Service Worker: Failed to parse push data', e)
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    image: data.image,
    vibrate: [200, 100, 200, 100, 200],
    tag: 'artisan-notification',
    requireInteraction: true,
    renotify: true,
    silent: false,
    data: {
      url: data.data?.url || data.url || '/',
      notificationId: data.data?.notificationId,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Artisan', options)
      .then(() => {
        console.log('Service Worker: Notification displayed')
        // Play sound for iOS
        if (self.registration.getNotifications) {
          return self.registration.getNotifications({ tag: 'artisan-notification' })
        }
      })
      .catch(err => console.error('Service Worker: Notification display failed', err))
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action)
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        const clientUrl = new URL(client.url).pathname
        const targetUrl = new URL(urlToOpen).pathname
        
        if (clientUrl === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Focus any existing window and navigate
      if (clientList.length > 0 && 'focus' in clientList[0]) {
        return clientList[0].focus().then(client => {
          if ('navigate' in client) {
            return client.navigate(urlToOpen)
          }
          return clients.openWindow(urlToOpen)
        })
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }).catch(err => {
      console.error('Service Worker: Failed to handle notification click', err)
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event.notification.tag)
})
