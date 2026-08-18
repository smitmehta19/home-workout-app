// "How to do it" visual for any movement.
//
// The drawn figure renders immediately and is always the base layer. Where we
// have real photographs of the start and end positions, they are loaded in the
// background and faded in over the top once BOTH have arrived, then crossfaded
// so you can see the two positions of the lift.
//
// Layering this way rather than swapping means there is never a blank frame:
// a slow connection, a failed request, being offline, or simply having no photo
// mapped for that movement all end at the same place — the drawing, showing.

import { createDemo, propFor } from './figure.js';
import { photoUrls } from '../data/media.js';

const FRAME_MS = 1600;

/**
 * @param {string} id             our exercise / drill id
 * @param {object} opts.exercise  exercise record, used for the drawn layer
 * @param {string} opts.pattern   pattern name when there is no exercise record
 * Returns an element with a `.stop()` method — call it when removing the node.
 */
export function createGuide(id, { exercise = null, pattern = null, alt = '' } = {}) {
  const drawn = createDemo(pattern ?? exercise?.pattern ?? 'carry', exercise ? propFor(exercise) : 'none');
  const urls = photoUrls(id);

  if (!urls) return drawn;

  const wrap = document.createElement('div');
  wrap.className = 'guide is-drawn';

  const drawnLayer = document.createElement('div');
  drawnLayer.className = 'guide-drawn';
  drawnLayer.append(drawn);
  wrap.append(drawnLayer);

  const badge = document.createElement('span');
  badge.className = 'guide-badge';
  badge.textContent = 'start';

  let timer = null;
  let loaded = 0;
  let frame = 0;

  const reveal = () => {
    wrap.classList.remove('is-drawn');
    wrap.append(badge);
    drawn.stop?.();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    timer = setInterval(() => {
      frame = 1 - frame;
      imgs.forEach((img, i) => img.classList.toggle('is-on', i === frame));
      badge.textContent = frame === 0 ? 'start' : 'end';
    }, FRAME_MS);
  };

  const imgs = urls.map((src, i) => {
    const img = document.createElement('img');
    img.alt = i === 0 ? `${alt} — start position` : `${alt} — end position`;
    img.className = `guide-img${i === 0 ? ' is-on' : ''}`;
    img.decoding = 'async';
    // Listeners go on before src: a cached or instantly failing request can
    // fire before a handler added afterwards would ever see it.
    img.addEventListener('load', () => { if (++loaded === urls.length) reveal(); }, { once: true });
    // On failure we simply never reveal — the drawing is already on screen.
    img.addEventListener('error', () => {}, { once: true });
    img.src = src;
    return img;
  });
  wrap.append(...imgs);

  wrap.stop = () => { clearInterval(timer); drawn.stop?.(); };
  return wrap;
}
