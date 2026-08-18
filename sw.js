// Offline support. The app shell is small and fully static, so it is cached on
// install and served cache-first — the app then works with no signal at all,
// which matters in a garage or basement.
//
// Bump CACHE when any shell file changes so returning visitors get the update.

const CACHE = 'home-gym-v2';
const PHOTOS = 'home-gym-photos-v2';

// Demonstration photographs are fetched from the Free Exercise DB and cached on
// first view, so a movement you have already looked at still shows its photos
// with no signal. They are never precached — that would be a large download for
// images you may never open.
const PHOTO_HOSTS = new Set(['cdn.jsdelivr.net', 'raw.githubusercontent.com']);

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
  './js/data/media.js',
  './js/data/mobility.js',
  './js/data/plans.js',
  './js/components/figure.js',
  './js/components/guide.js',
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
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== PHOTOS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (PHOTO_HOSTS.has(url.hostname)) {
    // Cache-first, and never fall back to index.html for an image — a missing
    // photo must fail so the app can swap in the drawn figure instead.
    event.respondWith(
      caches.open(PHOTOS).then((cache) => cache.match(request).then((hit) => hit ?? fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }))),
    );
    return;
  }

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
