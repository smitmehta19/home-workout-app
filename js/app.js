// Router and shell. Hash routing keeps the app a single static file tree, so it
// can be opened straight from disk or served from any static host with no
// rewrite rules.

import { renderToday } from './views/today.js';
import { renderMuscles } from './views/muscles.js';
import { renderHistory } from './views/history.js';
import { renderSettings } from './views/settings.js';
import { renderWorkout, teardownWorkout } from './views/player.js';
import { primeAudio } from './components/timer.js';

const ROUTES = {
  '/': { render: renderToday, nav: 'today', title: 'Today' },
  '/muscles': { render: renderMuscles, nav: 'muscles', title: 'Muscles' },
  '/history': { render: renderHistory, nav: 'history', title: 'History' },
  '/settings': { render: renderSettings, nav: 'settings', title: 'Settings' },
  '/workout': { render: renderWorkout, nav: null, title: 'Workout', full: true },
};

const root = document.getElementById('view');
const nav = document.getElementById('nav');
let currentPath = null;

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(query) };
}

function render() {
  const { path, params } = parseHash();
  const route = ROUTES[path] ?? ROUTES['/'];

  // Leaving the player must stop its timers, wake lock and animation loop.
  if (currentPath === '/workout' && path !== '/workout') teardownWorkout();
  currentPath = path;

  document.body.classList.toggle('is-fullscreen', Boolean(route.full));
  document.title = `${route.title} · Home Gym`;

  for (const link of nav.querySelectorAll('a')) {
    link.classList.toggle('is-on', link.dataset.nav === route.nav);
  }

  root.replaceChildren();
  route.render(root, params, render);
  if (!route.full) window.scrollTo({ top: 0 });
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
// The first tap anywhere unlocks audio so the rest timer can actually beep.
document.addEventListener('pointerdown', primeAudio, { once: true });

if (!location.hash) location.hash = '#/';
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');

      // When a new worker is waiting, hand over at once and reload, so a fix is
      // live on this launch rather than the next one. Guarded against loops:
      // only reload when a controller was already in place, and only once.
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        location.reload();
      });

      const takeOver = (worker) => {
        if (worker && navigator.serviceWorker.controller) worker.postMessage('skip-waiting');
      };
      if (reg.waiting) takeOver(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const fresh = reg.installing;
        fresh?.addEventListener('statechange', () => {
          if (fresh.state === 'installed') takeOver(fresh);
        });
      });

      // Check again when the app is brought back to the foreground.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    } catch {
      /* offline support is a bonus, not a requirement */
    }
  });
}
