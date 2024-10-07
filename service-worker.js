const CACHE_NAME = 'kiosk-cache-v1'; // Change this version when you update assets

// Registering the service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        'index.html',
        'app.html',
        'manifest.json',
        'assets/icon.png',
        'assets/gmail.png',
        'assets/commonapp.png',
        'assets/yahoo.png',
        'assets/collegeboard.png',
        'assets/icloud.png',
        // Add other assets as needed
      ]);
    })
  );
});

// Cleaning up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetching from the cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response or fetch from network
      return response || fetch(event.request);
    })
  );
});
