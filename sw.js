// Offline support.
//
// The app shell is served NETWORK-FIRST with a short timeout, falling back to
// cache. Cache-first was wrong here: it pinned returning visitors to whatever
// version they first installed, so a fix could ship and never reach anyone
// until the cache happened to turn over. Network-first means an online launch
// always runs current code, and the timeout keeps it usable on a bad
// connection — if the network has not answered in SHELL_TIMEOUT_MS the cached
// copy is served instead, and with no signal at all it falls straight through
// to cache.
//
// Photographs stay cache-first: their URLs are immutable, so a cached image is
// always correct and re-fetching it would only cost bandwidth.

const CACHE = 'home-gym-v3';
const SHELL_TIMEOUT_MS = 2500;
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
  './js/version.js',
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
    Promise.race([
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('slow')), SHELL_TIMEOUT_MS)),
    ]).catch(() => caches.match(request, { ignoreSearch: true })
      .then((cached) => cached ?? caches.match('./index.html'))),
  );
});

// Let the page ask for an immediate takeover after an update is found.
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
