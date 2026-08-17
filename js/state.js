// Persistent state. Everything lives in localStorage on this device — there is
// no account, no server and no network call anywhere in this app. That means
// clearing your browser data wipes your training history, so the Settings page
// offers a JSON export. Use it.

const KEY = 'hwa.v1';

const DEFAULT_SETTINGS = {
  daysPerWeek: 4,
  startDate: null,          // ISO date the programme began; set on first run
  unit: 'kg',
  // Smallest weight change you can actually make with the plates you own.
  // The progression engine only ever suggests weights in these steps.
  barbellIncrement: 2.5,    // one 1.25 kg plate on each side of the rod
  dumbbellIncrement: 1.25,  // per dumbbell
  rodWeight: 5,             // the empty rod itself
  rodMax: 40,               // most the rod can hold, loaded
  dumbbellMax: 20,          // most one dumbbell can hold, loaded
  sound: true,
  vibrate: true,
  restAutoStart: true,
};

const DEFAULT_STATE = {
  settings: { ...DEFAULT_SETTINGS },
  sessions: [],   // completed sessions, newest last
  active: null,   // in-progress session, so a refresh mid-workout doesn't lose it
};

let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw
      ? { ...DEFAULT_STATE, ...JSON.parse(raw), settings: { ...DEFAULT_SETTINGS, ...JSON.parse(raw).settings } }
      : structuredClone(DEFAULT_STATE);
  } catch {
    cache = structuredClone(DEFAULT_STATE);
  }
  if (!cache.settings.startDate) {
    cache.settings.startDate = todayISO();
    persist();
  }
  return cache;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Could not save state', err);
  }
}

export function todayISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Monday = 0 … Sunday = 6, which is how the split schedules are indexed. */
export function weekdayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7;
}

export const getSettings = () => load().settings;

export function saveSettings(patch) {
  load();
  cache.settings = { ...cache.settings, ...patch };
  persist();
  return cache.settings;
}

export const getSessions = () => load().sessions;

export function saveSession(session) {
  load();
  cache.sessions.push(session);
  cache.active = null;
  persist();
}

export const getActive = () => load().active;

export function setActive(session) {
  load();
  cache.active = session;
  persist();
}

export function clearActive() {
  load();
  cache.active = null;
  persist();
}

/**
 * Which programme week we're in, counted from the day the app was first opened.
 * Drives exercise rotation so the plan varies without losing its structure.
 */
export function weekNumber() {
  const start = new Date(getSettings().startDate + 'T00:00:00');
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return Math.max(0, Math.floor(days / 7));
}

/** Every recorded performance of one exercise, oldest first. */
export function historyFor(exerciseId) {
  const out = [];
  for (const s of getSessions()) {
    for (const e of s.entries) {
      if (e.exerciseId === exerciseId && e.sets.some((set) => set.done)) {
        out.push({ date: s.date, sets: e.sets.filter((set) => set.done) });
      }
    }
  }
  return out;
}

export const lastPerformance = (exerciseId) => historyFor(exerciseId).at(-1) ?? null;

/** Best estimated one-rep max ever recorded for an exercise, using Epley. */
export function bestE1RM(exerciseId) {
  let best = 0;
  for (const h of historyFor(exerciseId)) {
    for (const s of h.sets) {
      if (!s.weight || !s.reps) continue;
      best = Math.max(best, epley(s.weight, s.reps));
    }
  }
  return best;
}

export const epley = (weight, reps) => (reps <= 1 ? weight : weight * (1 + reps / 30));

export function exportJSON() {
  return JSON.stringify(load(), null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sessions)) {
    throw new Error('That file does not look like a workout backup.');
  }
  cache = {
    ...structuredClone(DEFAULT_STATE),
    ...parsed,
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
  };
  persist();
}

export function resetAll() {
  cache = structuredClone(DEFAULT_STATE);
  cache.settings.startDate = todayISO();
  persist();
}
