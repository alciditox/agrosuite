/* =====================================================================
   AgroSuite 360° · Service Worker Offline PWA
   Garantiza funcionamiento en campo y zonas rurales sin conexión a internet.
   ===================================================================== */

const CACHE_NAME = 'agrosuite-v2.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './hub.css',
  './hub.js',
  './manual.html',
  './manifest.webmanifest',
  './modules/shared/charts.js',
  './modules/shared/advisor.js',
  './modules/shared/farms.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Cache First con fallback a Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        // Cachear en caliente páginas o módulos nuevos
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback si no hay red
        return caches.match('./index.html');
      });
    })
  );
});
