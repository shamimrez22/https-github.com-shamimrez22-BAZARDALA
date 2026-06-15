const CACHE_NAME = 'bazar-dala-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install Event: cache core SPA shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clear legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET, API routes, admin paths and real-time Firestore synchronization calls to prevent local state locking
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase')
  ) {
    return;
  }

  // Apply Stale-While-Revalidate caching pattern for swift, offline-first instant loading
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Return cached main index file if internet connection drops completely during navigation
            if (request.mode === 'navigate') {
              return cache.match('/index.html') || cache.match('/');
            }
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
