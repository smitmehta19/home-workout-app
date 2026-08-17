// The guided workout. Press start and this walks you through every set: what
// to lift, how many reps to chase, when to rest and when to go again.

import { h, toast, confirmSheet, fmtWeight } from '../ui.js';
import { sessionFor, estimateMinutes, incrementFor } from '../plan.js';
import { byId } from '../data/exercises.js';
import { createDemo, propFor } from '../components/figure.js';
import { openExercise } from '../components/exercise-sheet.js';
import { Countdown, ScreenLock, mmss, chime, beep, primeAudio } from '../components/timer.js';
import {
  weekdayIndex, weekNumber, todayISO, getActive, setActive, clearActive, saveSession, getSettings, epley, bestE1RM,
} from '../state.js';

let countdown = null;
let demoNode = null;
const screenLock = new ScreenLock();

/** Tear down anything still running when we leave this route. */
export function teardownWorkout() {
  countdown?.stop();
  countdown = null;
  demoNode?.stop?.();
  demoNode = null;
  screenLock.release();
}

function buildSession(dayIdx) {
  const plan = sessionFor(dayIdx);
  if (plan.rest) return null;
  return {
    date: todayISO(),
    dayIdx,
    week: weekNumber(),
    dayName: plan.day.name,
    focus: plan.day.focus,
    startedAt: Date.now(),
    entries: plan.exercises.map(({ slot, exercise, suggestion }) => ({
      exerciseId: exercise.id,
      slotLabel: slot.label,
      rest: slot.rest,
      note: suggestion.note,
      sets: Array.from({ length: slot.sets }, () => ({
        weight: suggestion.weight ?? null,
        reps: suggestion.reps,
        done: false,
      })),
    })),
    cursor: { ex: 0, set: 0 },
  };
}

export function renderWorkout(root, params, rerender) {
  const dayIdx = Number(params.get('day') ?? weekdayIndex());
  const preview = params.get('preview') === '1';
  const plan = sessionFor(dayIdx);

  if (plan.rest) {
    root.replaceChildren(h('div', { class: 'page-head' },
      h('h1', {}, 'Rest day'),
      h('p', { class: 'muted' }, 'There is no session scheduled for that day.'),
      h('a', { class: 'btn btn-primary', href: '#/' }, 'Back to today'),
    ));
    return;
  }

  if (preview) return renderPreview(root, plan, dayIdx);

  const existing = getActive();
  const session = existing && existing.dayIdx === dayIdx && existing.date === todayISO()
    ? existing
    : buildSession(dayIdx);

  setActive(session);
  primeAudio();
  screenLock.acquire();

  const save = () => setActive(session);
  renderStep(root, session, save, rerender);
}

// ── read-only preview ───────────────────────────────────────────────────────
function renderPreview(root, plan, dayIdx) {
  root.replaceChildren(
    h('header', { class: 'page-head' },
      h('a', { class: 'back-link', href: '#/' }, '← Today'),
      h('h1', {}, plan.day.name),
      h('p', { class: 'muted' }, `${plan.day.focus} · ~${estimateMinutes(plan)} min`),
    ),
    h('section', { class: 'card' },
      h('ol', { class: 'ex-list' }, plan.exercises.map(({ slot, exercise, suggestion }, i) =>
        h('li', { class: 'ex-row', onclick: () => openExercise(exercise) },
          h('span', { class: 'ex-index' }, i + 1),
          h('div', { class: 'ex-main' },
            h('span', { class: 'ex-name' }, exercise.name),
            h('span', { class: 'ex-slot' }, slot.label),
          ),
          h('div', { class: 'ex-target' },
            h('strong', {}, `${slot.sets} × ${suggestion.reps}${exercise.timed ? 's' : ''}`),
            h('span', { class: 'muted' }, suggestion.loaded ? `${suggestion.weight} ${getSettings().unit}` : 'bodyweight'),
          ),
        ))),
      h('a', { class: 'btn btn-primary btn-block', href: `#/workout?day=${dayIdx}` }, 'Start this workout'),
    ),
  );
}

// ── the working screen ──────────────────────────────────────────────────────
function renderStep(root, session, save, rerender) {
  countdown?.stop();
  countdown = null;
  demoNode?.stop?.();

  const { ex: exIdx, set: setIdx } = session.cursor;

  if (exIdx >= session.entries.length) return renderSummary(root, session, rerender);

  const entry = session.entries[exIdx];
  const exercise = byId[entry.exerciseId];
  const set = entry.sets[setIdx];
  const unit = getSettings().unit;
  const increment = incrementFor(exercise) || 1;
  const totalSets = session.entries.reduce((n, e) => n + e.sets.length, 0);
  const doneSets = session.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);

  demoNode = createDemo(exercise.pattern, propFor(exercise));

  const stepper = (label, value, onChange, { step = 1, suffix = '', min = 0 } = {}) =>
    h('div', { class: 'stepper' },
      h('span', { class: 'stepper-label' }, label),
      h('div', { class: 'stepper-controls' },
        h('button', { class: 'step-btn', 'aria-label': `Decrease ${label}`, onclick: () => onChange(Math.max(min, round(value - step))) }, '−'),
        h('span', { class: 'stepper-value' }, value === null ? '—' : `${round(value)}${suffix}`),
        h('button', { class: 'step-btn', 'aria-label': `Increase ${label}`, onclick: () => onChange(round(value + step)) }, '+'),
      ),
    );

  const round = (n) => Math.round(n * 100) / 100;

  const loaded = incrementFor(exercise) > 0;

  const completeSet = () => {
    set.done = true;
    beep(760, 0.12);

    // Carry the numbers you actually used into the remaining sets.
    for (let i = setIdx + 1; i < entry.sets.length; i++) {
      if (!entry.sets[i].done) {
        entry.sets[i].weight = set.weight;
        entry.sets[i].reps = set.reps;
      }
    }

    const lastSetOfExercise = setIdx + 1 >= entry.sets.length;
    const lastExercise = exIdx + 1 >= session.entries.length;

    if (lastSetOfExercise && lastExercise) {
      session.cursor = { ex: session.entries.length, set: 0 };
      save();
      return renderStep(root, session, save, rerender);
    }

    session.cursor = lastSetOfExercise ? { ex: exIdx + 1, set: 0 } : { ex: exIdx, set: setIdx + 1 };
    save();
    renderRest(root, session, entry.rest, save, rerender);
  };

  const header = h('header', { class: 'player-head' },
    h('a', { class: 'icon-btn', href: '#/', title: 'Leave workout', onclick: teardownWorkout }, '✕'),
    h('div', { class: 'player-progress' },
      h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${(doneSets / totalSets) * 100}%` } })),
      h('span', {}, `${doneSets} / ${totalSets} sets`),
    ),
    h('button', { class: 'icon-btn', title: 'Exercise detail', onclick: () => openExercise(exercise) }, 'ⓘ'),
  );

  const body = h('div', { class: 'player-body' },
    h('p', { class: 'eyebrow' }, `${entry.slotLabel} · exercise ${exIdx + 1} of ${session.entries.length}`),
    h('h1', { class: 'player-title', onclick: () => openExercise(exercise) }, exercise.name),
    h('div', { class: 'player-demo' }, demoNode),

    setIdx === 0 && entry.note && h('p', { class: 'note note-coach' }, entry.note),

    h('div', { class: 'set-pips' }, entry.sets.map((s, i) =>
      h('span', { class: `pip${s.done ? ' is-done' : ''}${i === setIdx ? ' is-current' : ''}` }, i + 1))),

    h('p', { class: 'set-caption' },
      `Set ${setIdx + 1} of ${entry.sets.length}`,
      exercise.unilateral ? ' — each side' : '',
    ),

    h('div', { class: 'steppers' },
      loaded && stepper(`Weight (${unit})`, set.weight ?? 0, (v) => { set.weight = v; save(); renderStep(root, session, save, rerender); }, { step: increment }),
      stepper(exercise.timed ? 'Seconds' : 'Reps', set.reps, (v) => { set.reps = v; save(); renderStep(root, session, save, rerender); }, { step: exercise.timed ? 5 : 1, min: 1 }),
    ),

    exercise.timed
      ? h('button', { class: 'btn btn-primary btn-block btn-start', onclick: () => runHold(root, session, set.reps, completeSet) }, `Start ${set.reps}s hold`)
      : h('button', { class: 'btn btn-primary btn-block btn-start', onclick: completeSet }, 'Set complete'),

    h('div', { class: 'player-secondary' },
      h('button', { class: 'btn btn-ghost', onclick: async () => {
        if (await confirmSheet('Skip this exercise?', 'Its remaining sets will be left unlogged.', 'Skip')) {
          session.cursor = { ex: exIdx + 1, set: 0 };
          save();
          renderStep(root, session, save, rerender);
        }
      } }, 'Skip exercise'),
      h('button', { class: 'btn btn-ghost', onclick: async () => {
        if (await confirmSheet('End workout?', 'Sets you have already completed will be saved.', 'End workout')) {
          finish(session, rerender);
        }
      } }, 'End workout'),
    ),
  );

  root.replaceChildren(h('div', { class: 'player' }, header, body));
}

// ── timed holds (planks, wall sits, carries) ────────────────────────────────
function runHold(root, session, seconds, onDone) {
  const label = h('div', { class: 'countdown-value' }, mmss(seconds));
  const ring = h('div', { class: 'countdown-ring' }, label);
  const panel = h('div', { class: 'rest' },
    h('p', { class: 'eyebrow' }, 'Hold'),
    ring,
    h('button', { class: 'btn btn-ghost', onclick: () => { countdown?.stop(); onDone(); } }, 'Finish early'),
  );
  root.replaceChildren(h('div', { class: 'player' }, panel));

  countdown = new Countdown({
    seconds,
    onTick: (left, total) => {
      label.textContent = mmss(left);
      ring.style.setProperty('--progress', String(1 - left / total));
    },
    onDone,
  });
}

// ── rest between sets ───────────────────────────────────────────────────────
function renderRest(root, session, seconds, save, rerender) {
  const { ex: exIdx, set: setIdx } = session.cursor;
  const entry = session.entries[exIdx];
  const exercise = byId[entry.exerciseId];
  const next = entry.sets[setIdx];
  const unit = getSettings().unit;

  const label = h('div', { class: 'countdown-value' }, mmss(seconds));
  const ring = h('div', { class: 'countdown-ring' }, label);

  const skip = () => {
    countdown?.stop();
    countdown = null;
    renderStep(root, session, save, rerender);
  };

  const panel = h('div', { class: 'rest' },
    h('p', { class: 'eyebrow' }, 'Rest'),
    ring,
    h('div', { class: 'rest-actions' },
      h('button', { class: 'btn btn-ghost', onclick: () => countdown?.add(30) }, '+30s'),
      h('button', { class: 'btn btn-primary', onclick: skip }, 'Skip rest'),
    ),
    h('div', { class: 'up-next' },
      h('p', { class: 'eyebrow' }, 'Up next'),
      h('strong', {}, exercise.name),
      h('span', { class: 'muted' },
        `Set ${setIdx + 1} of ${entry.sets.length} · ${next.reps}${exercise.timed ? 's' : ' reps'}`,
        next.weight ? ` @ ${fmtWeight(next.weight, unit)}` : '',
      ),
      setIdx === 0 && h('button', { class: 'btn btn-ghost btn-sm', onclick: () => openExercise(exercise) }, 'How to do it'),
    ),
  );

  root.replaceChildren(h('div', { class: 'player' }, panel));

  countdown = new Countdown({
    seconds,
    onTick: (left, total) => {
      label.textContent = mmss(left);
      ring.style.setProperty('--progress', String(1 - left / total));
    },
    onDone: skip,
  });
}

// ── done ────────────────────────────────────────────────────────────────────
function finish(session, rerender) {
  const completed = session.entries.filter((e) => e.sets.some((s) => s.done));
  if (!completed.length) {
    clearActive();
    toast('Nothing logged — workout discarded.');
    location.hash = '#/';
    return;
  }
  const prs = detectPRs(session);
  saveSession({
    date: session.date,
    dayIdx: session.dayIdx,
    week: session.week,
    dayName: session.dayName,
    durationMin: Math.round((Date.now() - session.startedAt) / 60000),
    entries: session.entries,
    prs,
  });
  teardownWorkout();
  location.hash = '#/history?justfinished=1';
  rerender?.();
}

/** A PR is any set whose estimated 1RM beats everything previously recorded. */
function detectPRs(session) {
  const prs = [];
  for (const entry of session.entries) {
    const previousBest = bestE1RM(entry.exerciseId);
    let sessionBest = 0;
    for (const s of entry.sets) {
      if (s.done && s.weight && s.reps) sessionBest = Math.max(sessionBest, epley(s.weight, s.reps));
    }
    if (sessionBest > previousBest && previousBest > 0) {
      prs.push({ exerciseId: entry.exerciseId, e1rm: Math.round(sessionBest * 2) / 2 });
    }
  }
  return prs;
}

function renderSummary(root, session, rerender) {
  const doneSets = session.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const volume = session.entries.reduce((total, e) =>
    total + e.sets.filter((s) => s.done).reduce((v, s) => v + (s.weight ?? 0) * s.reps, 0), 0);
  const minutes = Math.round((Date.now() - session.startedAt) / 60000);
  chime();

  root.replaceChildren(h('div', { class: 'player' },
    h('div', { class: 'summary' },
      h('div', { class: 'summary-mark' }, '✓'),
      h('h1', {}, 'Session complete'),
      h('p', { class: 'muted' }, session.dayName),
      h('div', { class: 'stat-row' },
        h('div', { class: 'stat' }, h('strong', {}, doneSets), h('span', {}, 'sets')),
        h('div', { class: 'stat' }, h('strong', {}, `${minutes}`), h('span', {}, 'minutes')),
        h('div', { class: 'stat' }, h('strong', {}, Math.round(volume).toLocaleString()), h('span', {}, `${getSettings().unit} lifted`)),
      ),
      h('button', { class: 'btn btn-primary btn-block', onclick: () => finish(session, rerender) }, 'Save and finish'),
    ),
  ));
}
