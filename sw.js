// Offline support. The app shell is small and fully static, so it is cached on
// install and served cache-first — the app then works with no signal at all,
// which matters in a garage or basement.
//
// Bump CACHE when any shell file changes so returning visitors get the update.

const CACHE = 'home-gym-v1';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './js/app.js',
  './js/ui.js',
  './js/state.js',
  './js/plan.js',
  './js/data/exercises.js',
  './js/data/muscles.js',
  './js/data/plans.js',
  './js/components/figure.js',
  './js/components/bodymap.js',
  './js/components/timer.js',
  './js/components/exercise-sheet.js',
  './js/views/today.js',
  './js/views/player.js',
  './js/views/muscles.js',
  './js/views/history.js',
  './js/views/settings.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing; cache individually so one 404 can't break install.
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let video links go to the network

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      // Serve from cache immediately, then quietly refresh it for next time.
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached ?? caches.match('./index.html'));

      return cached ?? network;
    }),
  );
});
