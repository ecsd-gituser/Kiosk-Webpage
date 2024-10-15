const CACHE_NAME = 'kiosk-cache-v1'; // Change this version when you update assets

// Registering the service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        'index.html',
        'app.html',
        'manifest.json',
        'background.js',
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
// Background script (service worker)

let autoCloseTimer;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startAutoClose') {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      chrome.tabs.remove(sender.tab.id);
    }, 10000); // 10 seconds
    sendResponse({status: 'Timer started'});
  } else if (message.action === 'cancelAutoClose') {
    clearTimeout(autoCloseTimer);
    sendResponse({status: 'Timer cancelled'});
  }
  return true; // Keeps the message channel open for asynchronous response
});
