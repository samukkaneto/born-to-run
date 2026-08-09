const CACHE_VERSION = 'btr-public-v1'
const PRECACHE = [
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/logo.png',
]
const PUBLIC_PAGES = new Set([
  '/',
  '/sobre',
  '/historia',
  '/equipe',
  '/galeria',
  '/resultados',
  '/contato',
  '/instalar',
  '/privacidade',
  '/termos',
  '/offline',
])

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith('btr-') && key !== CACHE_VERSION).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  const isStaticAsset = url.pathname.startsWith('/_next/static/')
    || url.pathname.startsWith('/icons/')
    || /\.(?:css|js|woff2|png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname)

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          }
          return response
        })
      }),
    )
    return
  }

  if (request.mode === 'navigate' && PUBLIC_PAGES.has(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline'))),
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline')))
  }
})
