const CACHE_NAME = 'ckd-v1';
const URLS_TO_CACHE = [
  '/',
  '/original/index-ckd.html',
  '/manifest.json',
  '/ckdimage-1.jpg',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
  'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests for external resources we want to cache
  if (!event.request.url.startsWith(self.location.origin) && 
      !URLS_TO_CACHE.includes(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response or fetch from network
        return cachedResponse || fetch(event.request)
          .then(response => {
            // Cache new responses for same-origin requests
            if (event.request.url.startsWith(self.location.origin)) {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            }
            return response;
          });
      })
  );
});
