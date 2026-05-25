const CACHE = 'budget-app-v2';

const CDN_URLS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(CDN_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // For CDN resources: cache-first
  if (CDN_URLS.some((c) => url.startsWith(c))) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
    return;
  }

  // For the app page and local files: network-first, fallback to cache
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
