// The muscle map. Tap any muscle on the body and see everything you can train
// it with, given the gear you actually own.

import { h } from '../ui.js';
import { createBodyMap } from '../components/bodymap.js';
import { MUSCLES, muscleName } from '../data/muscles.js';
import { exercisesForMuscle } from '../data/exercises.js';
import { openExercise } from '../components/exercise-sheet.js';
import { weeklyVolume } from '../plan.js';
import { bestE1RM, getSettings } from '../state.js';

let view = 'front';
let selected = null;

function exerciseCard(exercise, tag) {
  const best = bestE1RM(exercise.id);
  return h('li', { class: 'pick-row', onclick: () => openExercise(exercise) },
    h('div', { class: 'ex-main' },
      h('span', { class: 'ex-name' }, exercise.name),
      h('span', { class: 'ex-slot' },
        exercise.equipment.join(' · '),
        best > 0 ? ` · best ${Math.round(best)} ${getSettings().unit}` : '',
      ),
    ),
    h('span', { class: `tag tag-${tag}` }, tag === 'primary' ? 'Primary' : 'Assists'),
  );
}

function resultsFor(muscleId) {
  if (!muscleId) {
    return h('div', { class: 'empty' },
      h('p', {}, 'Tap any muscle on the diagram to see what trains it.'),
    );
  }

  const info = MUSCLES[muscleId];
  const { primary, secondary } = exercisesForMuscle(muscleId);
  const volume = weeklyVolume()[muscleId] ?? 0;

  return h('div', { class: 'muscle-results' },
    h('header', { class: 'muscle-head' },
      h('h2', {}, info.name),
      h('p', { class: 'muted' }, info.blurb),
      h('div', { class: 'chips' },
        h('span', { class: 'chip' }, `${Math.round(volume)} sets/week in your plan`),
        h('span', { class: 'chip chip-quiet' }, `${primary.length} direct exercises`),
      ),
    ),
    primary.length > 0 && h('section', {},
      h('h3', {}, 'Trains it directly'),
      h('ul', { class: 'pick-list' }, primary.map((e) => exerciseCard(e, 'primary'))),
    ),
    secondary.length > 0 && h('section', {},
      h('h3', {}, 'Also works it'),
      h('ul', { class: 'pick-list' }, secondary.map((e) => exerciseCard(e, 'secondary'))),
    ),
    primary.length === 0 && secondary.length === 0 && h('p', { class: 'muted' }, 'No exercises tagged for this muscle yet.'),
  );
}

export function renderMuscles(root) {
  const results = h('div', { class: 'results-slot' }, resultsFor(selected));
  const figureSlot = h('div', { class: 'body-figure' });

  const select = (muscleId) => {
    selected = selected === muscleId ? null : muscleId;
    draw();
    results.replaceChildren(resultsFor(selected));
    if (selected) results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const draw = () => figureSlot.replaceChildren(createBodyMap(view, { selected, onSelect: select }));

  const toggle = h('div', { class: 'seg' },
    ...['front', 'back'].map((v) => h('button', {
      class: `seg-btn${view === v ? ' is-on' : ''}`,
      onclick: () => {
        view = v;
        [...toggle.children].forEach((c, i) => c.classList.toggle('is-on', ['front', 'back'][i] === v));
        draw();
      },
    }, v === 'front' ? 'Front' : 'Back')),
  );

  draw();

  root.replaceChildren(
    h('header', { class: 'page-head' },
      h('h1', {}, 'Muscle map'),
      h('p', { class: 'muted' }, 'Every muscle, and what you can do for it at home.'),
    ),
    h('section', { class: 'card card-body' }, toggle, figureSlot),
    h('section', { class: 'card' }, results),
  );
}
