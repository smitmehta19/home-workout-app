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

export function openExercise(exercise) {
  let guide;
  openSheet(() => {
    guide = createGuide(exercise.id, { exercise, alt: exercise.name });
    const unit = getSettings().unit;
    const history = historyFor(exercise.id).slice(-5).reverse();
    const best = bestE1RM(exercise.id);

    return h('article', { class: 'ex-detail' },
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
    );
  }, { onClose: () => guide?.stop?.() });
}

/** The same treatment for a warm-up drill or a stretch. */
export function openDrill(item, kind = 'stretch') {
  let guide;
  openSheet(() => {
    guide = createGuide(item.id, { pattern: item.pattern, alt: item.name, photoId: item.photoId ?? null });
    const dose = item.seconds
      ? `${item.seconds} seconds${item.perSide ? ' each side' : ''}`
      : `${item.reps} reps${item.perSide ? ' each side' : ''}`;

    return h('article', { class: 'ex-detail' },
      h('div', { class: 'guide-hero' }, guide),
      h('header', {},
        h('h2', {}, item.name),
        h('div', { class: 'chips' },
          h('span', { class: 'chip' }, kind === 'stretch' ? 'Stretch' : item.phase),
          h('span', { class: 'chip chip-quiet' }, dose),
        ),
      ),

      h('section', {}, h('h3', {}, 'How to do it'),
        h('ol', { class: 'steps' }, (item.steps ?? []).map((s) => h('li', {}, s)))),
      h('section', {}, h('h3', {}, 'The point of it'),
        h('ul', { class: 'cues' }, h('li', {}, item.cue))),
      item.avoid?.length > 0 && h('section', {}, h('h3', {}, 'Avoid'),
        h('ul', { class: 'mistakes' }, item.avoid.map((m) => h('li', {}, m)))),

      kind === 'stretch' && h('p', { class: 'muted small' },
        'Ease to the point of mild tension and hold there, breathing normally. It should never be sharp. '
        + 'Stretching is done after training, on warm muscle, which is when it actually improves flexibility.'),

      h('a', { class: 'btn btn-ghost btn-block', href: searchUrl(`how to ${item.name} form`), target: '_blank', rel: 'noopener' },
        'Watch a video demonstration ↗'),
      credit(item.id),
    );
  }, { onClose: () => guide?.stop?.() });
}
