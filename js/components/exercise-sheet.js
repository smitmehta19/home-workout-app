// Detail views: the full "how do I do this" for an exercise, and the same for a
// warm-up drill or a stretch. Both lead with real photographs of the start and
// end positions where we have them, falling back to the drawn figure otherwise.

import { h, openSheet, fmtWeight, relativeDate } from '../ui.js';
import { createGuide } from './guide.js';
import { videoUrl } from '../data/exercises.js';
import { muscleName } from '../data/muscles.js';
import { MEDIA_CREDIT, hasPhotos, isApproximate } from '../data/media.js';
import { historyFor, bestE1RM, getSettings } from '../state.js';

const searchUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const credit = (id) => hasPhotos(id)
  ? h('p', { class: 'credit' },
      isApproximate(id) ? 'Photograph shows the closest related movement, from ' : 'Photographs from ',
      h('a', { href: MEDIA_CREDIT.url, target: '_blank', rel: 'noopener' }, MEDIA_CREDIT.name),
      '. Read the steps above for this exact variation.')
  : h('p', { class: 'credit' }, 'Drawn demonstration — no photograph mapped for this movement yet.');

/**
 * Open an exercise. Pass `list` and `index` and the sheet gains next/previous
 * controls, so you can walk the whole session or muscle group without closing
 * and reopening — swipe sideways, use the arrows, or press left/right.
 */
export function openExercise(exercise, { list = null, index = 0 } = {}) {
  const items = list?.length ? list : [exercise];
  let at = list?.length ? index : 0;
  let guide;
  let sheet;

  const go = (delta) => {
    const next = at + delta;
    if (next < 0 || next >= items.length) return;
    at = next;
    guide?.stop?.();
    sheet.setContent(render());
  };

  const render = () => {
    const current = items[at];
    guide = createGuide(current.id, { exercise: current, alt: current.name });
    return body(current, items.length > 1 ? { at, total: items.length, go } : null, guide);
  };

  sheet = openSheet(() => render(), {
    onClose: () => guide?.stop?.(),
    onPrev: () => go(-1),
    onNext: () => go(1),
  });
  return sheet;
}

function pager(nav) {
  if (!nav) return null;
  return h('nav', { class: 'sheet-pager' },
    h('button', {
      class: 'pager-btn', disabled: nav.at === 0, 'aria-label': 'Previous exercise',
      onclick: () => nav.go(-1),
    }, '‹'),
    h('span', { class: 'pager-count' }, `${nav.at + 1} of ${nav.total}`),
    h('button', {
      class: 'pager-btn', disabled: nav.at === nav.total - 1, 'aria-label': 'Next exercise',
      onclick: () => nav.go(1),
    }, '›'),
  );
}

function body(exercise, nav, guide) {
  {
    const unit = getSettings().unit;
    const history = historyFor(exercise.id).slice(-5).reverse();
    const best = bestE1RM(exercise.id);

    return h('article', { class: 'ex-detail' },
      pager(nav),
      h('div', { class: 'guide-hero' }, guide),
      h('header', {},
        h('h2', {}, exercise.name),
        h('p', { class: 'muted' },
          exercise.primary.map(muscleName).join(' · '),
          exercise.secondary?.length ? ` — plus ${exercise.secondary.map(muscleName).join(', ')}` : '',
        ),
        h('div', { class: 'chips' },
          h('span', { class: 'chip' }, exercise.type === 'compound' ? 'Compound' : 'Isolation'),
          exercise.unilateral && h('span', { class: 'chip' }, 'Per side'),
          exercise.timed && h('span', { class: 'chip' }, 'Timed'),
          ...exercise.equipment.map((e) => h('span', { class: 'chip chip-quiet' }, e)),
        ),
      ),

      best > 0 && h('div', { class: 'ex-stat' },
        h('span', {}, 'Estimated 1RM'),
        h('strong', {}, fmtWeight(Math.round(best * 2) / 2, unit)),
      ),

      h('section', {}, h('h3', {}, 'Set up'), h('p', {}, exercise.setup)),
      h('section', {}, h('h3', {}, 'How to do it'),
        h('ol', { class: 'steps' }, exercise.steps.map((s) => h('li', {}, s)))),
      h('section', {}, h('h3', {}, 'Cues that matter'),
        h('ul', { class: 'cues' }, exercise.cues.map((c) => h('li', {}, c)))),
      h('section', {}, h('h3', {}, 'Common mistakes'),
        h('ul', { class: 'mistakes' }, exercise.mistakes.map((m) => h('li', {}, m)))),

      history.length > 0 && h('section', {},
        h('h3', {}, 'Your last sessions'),
        h('ul', { class: 'hist-list' }, history.map((entry) => h('li', {},
          h('span', { class: 'muted' }, relativeDate(entry.date)),
          h('span', {}, entry.sets.map((s) =>
            s.weight ? `${s.reps}×${s.weight}` : `${s.reps}${exercise.timed ? 's' : ''}`).join('  ·  ')),
        ))),
      ),

      h('a', { class: 'btn btn-ghost btn-block', href: videoUrl(exercise), target: '_blank', rel: 'noopener' },
        'Watch a video demonstration ↗'),
      credit(exercise.id),
      nav && h('div', { class: 'pager-foot' },
        h('button', { class: 'btn btn-ghost', disabled: nav.at === 0, onclick: () => nav.go(-1) }, '‹ Previous'),
        h('button', { class: 'btn btn-ghost', disabled: nav.at === nav.total - 1, onclick: () => nav.go(1) }, 'Next ›'),
      ),
    );
  }
}

/** The same treatment for a warm-up drill or a stretch. */
export function openDrill(item, kind = 'stretch', { list = null, index = 0 } = {}) {
  const items = list?.length ? list : [item];
  let at = list?.length ? index : 0;
  let guide;
  let sheet;

  const go = (delta) => {
    const next = at + delta;
    if (next < 0 || next >= items.length) return;
    at = next;
    guide?.stop?.();
    sheet.setContent(drillBody(items[at], kind, items.length > 1 ? { at, total: items.length, go } : null));
  };

  sheet = openSheet(() => drillBody(items[at], kind, items.length > 1 ? { at, total: items.length, go } : null), {
    onClose: () => guide?.stop?.(),
    onPrev: () => go(-1),
    onNext: () => go(1),
  });
  return sheet;

  function drillBody(item, kind2, nav) {
    guide = createGuide(item.id, { pattern: item.pattern, alt: item.name, photoId: item.photoId ?? null });
    const dose = item.seconds
      ? `${item.seconds} seconds${item.perSide ? ' each side' : ''}`
      : `${item.reps} reps${item.perSide ? ' each side' : ''}`;

    return h('article', { class: 'ex-detail' },
      pager(nav),
      h('div', { class: 'guide-hero' }, guide),
      h('header', {},
        h('h2', {}, item.name),
        h('div', { class: 'chips' },
          h('span', { class: 'chip' }, kind2 === 'stretch' ? 'Stretch' : item.phase),
          h('span', { class: 'chip chip-quiet' }, dose),
        ),
      ),

      h('section', {}, h('h3', {}, 'How to do it'),
        h('ol', { class: 'steps' }, (item.steps ?? []).map((s) => h('li', {}, s)))),
      h('section', {}, h('h3', {}, 'The point of it'),
        h('ul', { class: 'cues' }, h('li', {}, item.cue))),
      item.avoid?.length > 0 && h('section', {}, h('h3', {}, 'Avoid'),
        h('ul', { class: 'mistakes' }, item.avoid.map((m) => h('li', {}, m)))),

      kind2 === 'stretch' && h('p', { class: 'muted small' },
        'Ease to the point of mild tension and hold there, breathing normally. It should never be sharp. '
        + 'Stretching is done after training, on warm muscle, which is when it actually improves flexibility.'),

      h('a', { class: 'btn btn-ghost btn-block', href: searchUrl(`how to ${item.name} form`), target: '_blank', rel: 'noopener' },
        'Watch a video demonstration ↗'),
      credit(item.id),
      nav && h('div', { class: 'pager-foot' },
        h('button', { class: 'btn btn-ghost', disabled: nav.at === 0, onclick: () => nav.go(-1) }, '‹ Previous'),
        h('button', { class: 'btn btn-ghost', disabled: nav.at === nav.total - 1, onclick: () => nav.go(1) }, 'Next ›'),
      ),
    );
  }
}
