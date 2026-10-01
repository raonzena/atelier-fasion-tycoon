// Cache immutable game artwork at runtime. Keep HTML, CSS and game logic network-first.
const ART_CACHE = 'atelier-art-v1';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name.startsWith('atelier-art-') && name !== ART_CACHE).map(name => caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL('./assets/', self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(ART_CACHE);
    const saved = await cache.match(event.request);
    if (saved) return saved;
    const response = await fetch(event.request);
    if (response.ok && response.type === 'basic') event.waitUntil(cache.put(event.request, response.clone()));
    return response;
  })());
});
