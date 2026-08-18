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
import { photoSources } from '../data/media.js';

const FRAME_MS = 1600;

/**
 * @param {string} id             our exercise / drill id
 * @param {object} opts.exercise  exercise record, used for the drawn layer
 * @param {string} opts.pattern   pattern name when there is no exercise record
 * Returns an element with a `.stop()` method — call it when removing the node.
 */
export function createGuide(id, { exercise = null, pattern = null, alt = '', photoId = null } = {}) {
  const drawn = createDemo(pattern ?? exercise?.pattern ?? 'carry', exercise ? propFor(exercise) : 'none');
  const sources = photoSources(photoId ?? id);

  if (!sources) return drawn;

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

  const imgs = sources.map((source, i) => {
    const img = document.createElement('img');
    img.alt = i === 0 ? `${alt} — start position` : `${alt} — end position`;
    img.className = `guide-img${i === 0 ? ' is-on' : ''}`;
    img.decoding = 'async';
    let triedRetry = false;
    // Listeners go on before src: a cached or instantly failing request can
    // fire before a handler added afterwards would ever see it.
    img.addEventListener('load', () => { if (++loaded === sources.length) reveal(); });
    img.addEventListener('error', () => {
      // CDN failed — try the origin once. If that fails too we simply never
      // reveal, and the drawing already on screen stays.
      if (triedRetry) return;
      triedRetry = true;
      img.src = source.retry;
    });
    img.src = source.src;
    return img;
  });
  wrap.append(...imgs);

  wrap.stop = () => { clearInterval(timer); drawn.stop?.(); };
  return wrap;
}
