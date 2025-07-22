const CACHE_NAME = 'chhavinity-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Enhanced Push notification event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'New message from Chhavinity',
    icon: data.icon || '/icons/icon-96x96.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'message',
    requireInteraction: false,
    silent: false,
    data: {
      url: data.url || '/',
      userId: data.userId,
      messageId: data.messageId,
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || '1'
    },
    actions: [
      {
        action: 'reply',
        title: 'Reply',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'mark-read',
        title: 'Mark Read'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Chhavinity', options)
  );
});

// Enhanced Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked with action:', event.action);
  
  const notification = event.notification;
  const action = event.action;
  
  notification.close();

  if (action === 'close') {
    return;
  }

  if (action === 'mark-read') {
    // Handle mark as read
    event.waitUntil(
      self.registration.showNotification('Message marked as read', {
        body: 'Message has been marked as read',
        icon: '/icons/icon-96x96.png',
        tag: 'mark-read',
        requireInteraction: false
      })
    );
    return;
  }

  // Default action (including reply) - open the app
  const urlToOpen = notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
