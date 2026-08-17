// Rest timer, plus the little cues that let you keep your eyes off the screen
// between sets. Audio is generated with the Web Audio API rather than shipping
// sound files, so the app stays dependency-free and works offline.

import { getSettings } from '../state.js';

let ctx = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers suspend the context until a user gesture unlocks it.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Unlock audio on the first tap so later beeps aren't blocked. */
export function primeAudio() {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.01);
}

export function beep(frequency = 880, duration = 0.14, volume = 0.22) {
  if (!getSettings().sound) return;
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

export function buzz(pattern = 200) {
  if (!getSettings().vibrate) return;
  navigator.vibrate?.(pattern);
}

/** Three rising tones — rest is over, go again. */
export function chime() {
  beep(660, 0.13);
  setTimeout(() => beep(880, 0.13), 150);
  setTimeout(() => beep(1180, 0.22), 300);
  buzz([180, 90, 180]);
}

/**
 * A wall-clock countdown. Uses timestamps rather than accumulating intervals so
 * it stays accurate when the browser throttles background tabs — which phones
 * do aggressively the moment you put the screen to sleep mid-set.
 */
export class Countdown {
  constructor({ seconds, onTick, onDone }) {
    this.total = seconds;
    this.onTick = onTick;
    this.onDone = onDone;
    this.endAt = Date.now() + seconds * 1000;
    this.warned = false;
    this.finished = false;
    this.handle = setInterval(() => this.check(), 200);
    this.check();
  }

  get remaining() {
    return Math.max(0, Math.ceil((this.endAt - Date.now()) / 1000));
  }

  check() {
    const left = this.remaining;
    this.onTick?.(left, this.total);
    if (left <= 3 && left > 0 && !this.warned) {
      this.warned = true;
      beep(560, 0.1, 0.16);
    }
    if (left === 0 && !this.finished) {
      this.finished = true;
      chime();
      this.stop();
      this.onDone?.();
    }
  }

  add(seconds) {
    this.endAt += seconds * 1000;
    this.total += seconds;
    this.warned = false;
    this.finished = false;
    this.check();
  }

  stop() {
    clearInterval(this.handle);
    this.handle = null;
  }
}

export const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * Keeps the screen awake during a workout where the platform allows it.
 * Silently does nothing on browsers without the Wake Lock API.
 */
export class ScreenLock {
  async acquire() {
    try {
      this.sentinel = await navigator.wakeLock?.request('screen');
      this.onVisible = () => {
        if (document.visibilityState === 'visible' && this.sentinel?.released !== false) this.acquire();
      };
      document.addEventListener('visibilitychange', this.onVisible);
    } catch {
      /* not supported, or denied — not worth surfacing */
    }
  }

  release() {
    document.removeEventListener('visibilitychange', this.onVisible ?? (() => {}));
    this.sentinel?.release?.().catch(() => {});
    this.sentinel = null;
  }
}
