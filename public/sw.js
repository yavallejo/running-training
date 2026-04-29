const CAHE_NAME = 'yadira-running-v1';
const urlsToCache = [
  '/',
  '/plan',
  '/estadisticas',
  '/login',
  '/icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CAHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click Received.')
  event.notification.close()
  event.waitUntil(clients.openWindow('https://your-website.com'))
});
