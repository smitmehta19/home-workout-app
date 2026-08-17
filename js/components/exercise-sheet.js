// The full detail view for one exercise: animated demo, how to do it, what to
// watch for, what you lifted last time, and a link out to video if you want to
// see a real human do it.

import { h, openSheet, fmtWeight, relativeDate } from '../ui.js';
import { createDemo, propFor } from './figure.js';
import { videoUrl } from '../data/exercises.js';
import { muscleName } from '../data/muscles.js';
import { historyFor, bestE1RM, getSettings } from '../state.js';

export function openExercise(exercise) {
  let demo;
  openSheet(() => {
    demo = createDemo(exercise.pattern, propFor(exercise));
    const unit = getSettings().unit;
    const history = historyFor(exercise.id).slice(-5).reverse();
    const best = bestE1RM(exercise.id);

    return h('article', { class: 'ex-detail' },
      h('header', { class: 'ex-detail-head' },
        h('div', { class: 'ex-demo-frame' }, demo),
        h('div', {},
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
      ),

      best > 0 && h('div', { class: 'ex-stat' },
        h('span', {}, 'Estimated 1RM'),
        h('strong', {}, fmtWeight(Math.round(best * 2) / 2, unit)),
      ),

      h('section', {},
        h('h3', {}, 'Set up'),
        h('p', {}, exercise.setup),
      ),

      h('section', {},
        h('h3', {}, 'How to do it'),
        h('ol', { class: 'steps' }, exercise.steps.map((s) => h('li', {}, s))),
      ),

      h('section', {},
        h('h3', {}, 'Cues that matter'),
        h('ul', { class: 'cues' }, exercise.cues.map((c) => h('li', {}, c))),
      ),

      h('section', {},
        h('h3', {}, 'Common mistakes'),
        h('ul', { class: 'mistakes' }, exercise.mistakes.map((m) => h('li', {}, m))),
      ),

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
    );
  }, { onClose: () => demo?.stop?.() });
}
