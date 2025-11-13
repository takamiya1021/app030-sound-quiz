const CACHE_NAME = 'sound-quiz-v1';
const SOUND_CACHE = 'sound-quiz-sounds-v1';

const APP_SHELL = [
  '/',
  '/quiz',
  '/library',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// インストール時
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL);
    }).catch((error) => {
      console.error('[SW] Failed to cache app shell:', error);
    })
  );
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== SOUND_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    // Gemini API: Network First
    if (url.hostname === 'generativelanguage.googleapis.com') {
      event.respondWith(
        fetch(request).catch(() => {
          // ネットワークエラー時はフォールバック
          return new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );
    }
    return;
  }

  // 音源ファイル: Cache First
  if (url.pathname.includes('/sounds/')) {
    event.respondWith(
      caches.open(SOUND_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            console.log('[SW] Serving sound from cache:', url.pathname);
            return response;
          }

          return fetch(request).then((networkResponse) => {
            console.log('[SW] Caching sound:', url.pathname);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // App Shell: Cache First
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log('[SW] Serving from cache:', url.pathname);
        return response;
      }

      return fetch(request).then((networkResponse) => {
        // Cache the new resource for future use
        if (request.method === 'GET' && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
