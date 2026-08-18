// The guided workout. Press start and this walks you through the whole session:
// the RAMP warm-up, every working set, then the stretch routine.
//
// Warm-up and cool-down are phases of the session, not optional extras — you
// move through them the same way you move through the working sets, and the
// summary reports whether you finished them.

import { h, toast, confirmSheet, fmtWeight } from '../ui.js';
import { sessionFor, estimateMinutes, incrementFor } from '../plan.js';
import { byId } from '../data/exercises.js';
import { createGuide } from '../components/guide.js';
import { openExercise, openDrill } from '../components/exercise-sheet.js';
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

function stopTransient() {
  countdown?.stop();
  countdown = null;
  demoNode?.stop?.();
  demoNode = null;
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
    warmup: plan.warmup.map((i) => ({ ...i, done: false })),
    cooldown: plan.cooldown.map((i) => ({ ...i, done: false })),
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
    cursor: { phase: 'warmup', idx: 0, set: 0, side: 0 },
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
  const session = existing && existing.dayIdx === dayIdx && existing.date === todayISO() && existing.warmup
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
      h('p', { class: 'muted' }, `${plan.day.focus} · ~${estimateMinutes(plan)} min including warm-up and stretching`),
    ),
    h('section', { class: 'card' },
      h('h3', {}, `Warm-up · ${plan.warmup.length} drills`),
      h('ul', { class: 'prep-list' }, plan.warmup.map((i) => h('li', { onclick: () => openDrill(i, 'warmup') },
        h('span', { class: 'prep-phase' }, i.phase),
        h('span', {}, i.name),
        h('span', { class: 'muted' }, i.seconds ? `${i.seconds}s` : `${i.reps}${i.perSide ? '/side' : ''}`),
      ))),
    ),
    h('section', { class: 'card' },
      h('h3', {}, 'Workout'),
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
    ),
    h('section', { class: 'card' },
      h('h3', {}, `Stretching · ${plan.cooldown.length} holds`),
      h('ul', { class: 'prep-list' }, plan.cooldown.map((i) => h('li', { onclick: () => openDrill(i, 'stretch') },
        h('span', { class: 'prep-phase' }, 'Hold'),
        h('span', {}, i.name),
        h('span', { class: 'muted' }, `${i.seconds}s${i.perSide ? '/side' : ''}`),
      ))),
    ),
    h('a', { class: 'btn btn-primary btn-block', href: `#/workout?day=${dayIdx}` }, 'Start this workout'),
  );
}

// ── dispatch ────────────────────────────────────────────────────────────────
function renderStep(root, session, save, rerender) {
  stopTransient();
  const { phase } = session.cursor;
  if (phase === 'warmup') return renderPrep(root, session, save, rerender, 'warmup');
  if (phase === 'cooldown') return renderPrep(root, session, save, rerender, 'cooldown');
  if (phase === 'done') return renderSummary(root, session, rerender);
  return renderWork(root, session, save, rerender);
}

function overallProgress(session) {
  const total = session.warmup.length + session.cooldown.length
    + session.entries.reduce((n, e) => n + e.sets.length, 0);
  const done = session.warmup.filter((i) => i.done).length
    + session.cooldown.filter((i) => i.done).length
    + session.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  return { done, total };
}

function playerHeader(session, onInfo) {
  const { done, total } = overallProgress(session);
  return h('header', { class: 'player-head' },
    h('a', { class: 'icon-btn', href: '#/', title: 'Leave workout', onclick: teardownWorkout }, '✕'),
    h('div', { class: 'player-progress' },
      h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${(done / total) * 100}%` } })),
      h('span', {}, `${done} / ${total}`),
    ),
    onInfo
      ? h('button', { class: 'icon-btn', title: 'Exercise detail', onclick: onInfo }, 'ⓘ')
      : h('span', { class: 'icon-btn is-ghost' }, ''),
  );
}

// ── warm-up and stretching ──────────────────────────────────────────────────
function renderPrep(root, session, save, rerender, phase) {
  const items = session[phase];
  const { idx, side } = session.cursor;

  if (idx >= items.length) {
    session.cursor = phase === 'warmup'
      ? { phase: 'work', idx: 0, set: 0, side: 0 }
      : { phase: 'done', idx: 0, set: 0, side: 0 };
    save();
    return renderStep(root, session, save, rerender);
  }

  const item = items[idx];
  const isStretch = phase === 'cooldown';
  const sideLabel = item.perSide ? (side === 0 ? 'Left side' : 'Right side') : null;

  const advance = () => {
    if (item.perSide && side === 0) {
      session.cursor = { ...session.cursor, side: 1 };
    } else {
      item.done = true;
      session.cursor = { phase, idx: idx + 1, set: 0, side: 0 };
    }
    save();
    renderStep(root, session, save, rerender);
  };

  demoNode = createGuide(item.id, { pattern: item.pattern, alt: item.name, photoId: item.photoId ?? null });

  const label = h('div', { class: 'countdown-value' }, item.seconds ? mmss(item.seconds) : `${item.reps}`);
  const ring = h('div', { class: `countdown-ring${isStretch ? ' is-stretch' : ''}` }, label);

  const pips = h('div', { class: 'prep-pips' }, items.map((it, i) =>
    h('span', { class: `pip-dot${it.done ? ' is-done' : ''}${i === idx ? ' is-current' : ''}` })));

  root.replaceChildren(h('div', { class: 'player' },
    playerHeader(session, () => openDrill(item, isStretch ? 'stretch' : 'warmup')),
    h('div', { class: 'prep' },
      h('p', { class: 'eyebrow' },
        isStretch ? 'Cool-down · stretch' : `Warm-up · ${item.phase}`,
        ` · ${idx + 1} of ${items.length}`),
      h('h1', { class: 'prep-title', onclick: () => openDrill(item, isStretch ? 'stretch' : 'warmup') }, item.name),
      sideLabel && h('p', { class: 'prep-side' }, sideLabel),
      h('div', { class: 'prep-demo' }, demoNode),
      ring,
      h('p', { class: 'prep-cue' }, item.cue),
      h('button', { class: 'btn btn-primary btn-block btn-start', onclick: advance },
        item.seconds ? 'Done' : `Done — ${item.reps}${item.perSide ? ' this side' : ' reps'}`),
      pips,
    ),
  ));

  // Timed drills count themselves down and roll on; rep-based ones wait for you.
  if (item.seconds) {
    countdown = new Countdown({
      seconds: item.seconds,
      onTick: (left, total) => {
        label.textContent = mmss(left);
        ring.style.setProperty('--progress', String(1 - left / total));
      },
      onDone: advance,
    });
  } else {
    ring.style.setProperty('--progress', '1');
  }
}

// ── working sets ────────────────────────────────────────────────────────────
function renderWork(root, session, save, rerender) {
  const { idx: exIdx, set: setIdx } = session.cursor;

  if (exIdx >= session.entries.length) {
    session.cursor = { phase: 'cooldown', idx: 0, set: 0, side: 0 };
    save();
    return renderStep(root, session, save, rerender);
  }

  const entry = session.entries[exIdx];
  const exercise = byId[entry.exerciseId];
  const set = entry.sets[setIdx];
  const unit = getSettings().unit;
  const increment = incrementFor(exercise) || 1;
  const loaded = incrementFor(exercise) > 0;
  const round = (n) => Math.round(n * 100) / 100;

  demoNode = createGuide(exercise.id, { exercise, alt: exercise.name });

  const stepper = (labelText, value, onChange, { step = 1, min = 0 } = {}) =>
    h('div', { class: 'stepper' },
      h('span', { class: 'stepper-label' }, labelText),
      h('div', { class: 'stepper-controls' },
        h('button', { class: 'step-btn', 'aria-label': `Decrease ${labelText}`, onclick: () => onChange(Math.max(min, round(value - step))) }, '−'),
        h('span', { class: 'stepper-value' }, value === null ? '—' : `${round(value)}`),
        h('button', { class: 'step-btn', 'aria-label': `Increase ${labelText}`, onclick: () => onChange(round(value + step)) }, '+'),
      ),
    );

  const completeSet = () => {
    set.done = true;
    beep(760, 0.12);

    for (let i = setIdx + 1; i < entry.sets.length; i++) {
      if (!entry.sets[i].done) {
        entry.sets[i].weight = set.weight;
        entry.sets[i].reps = set.reps;
      }
    }

    const lastSetOfExercise = setIdx + 1 >= entry.sets.length;
    const lastExercise = exIdx + 1 >= session.entries.length;

    if (lastSetOfExercise && lastExercise) {
      session.cursor = { phase: 'cooldown', idx: 0, set: 0, side: 0 };
      save();
      return renderStep(root, session, save, rerender);
    }

    session.cursor = lastSetOfExercise
      ? { phase: 'work', idx: exIdx + 1, set: 0, side: 0 }
      : { phase: 'work', idx: exIdx, set: setIdx + 1, side: 0 };
    save();
    renderRest(root, session, entry.rest, save, rerender);
  };

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
        if (await confirmSheet('Skip this exercise?', 'Its remaining sets will be left unlogged. The stretch routine still runs at the end.', 'Skip')) {
          session.cursor = { phase: 'work', idx: exIdx + 1, set: 0, side: 0 };
          save();
          renderStep(root, session, save, rerender);
        }
      } }, 'Skip exercise'),
      h('button', { class: 'btn btn-ghost', onclick: async () => {
        if (await confirmSheet('Finish the lifting?', 'Skips straight to the stretch routine. Sets already completed are saved.', 'Go to stretches')) {
          session.cursor = { phase: 'cooldown', idx: 0, set: 0, side: 0 };
          save();
          renderStep(root, session, save, rerender);
        }
      } }, 'End lifting'),
    ),
  );

  root.replaceChildren(h('div', { class: 'player' },
    playerHeader(session, () => openExercise(exercise)), body));
}

// ── timed holds inside the working sets ─────────────────────────────────────
function runHold(root, session, seconds, onDone) {
  const label = h('div', { class: 'countdown-value' }, mmss(seconds));
  const ring = h('div', { class: 'countdown-ring' }, label);
  root.replaceChildren(h('div', { class: 'player' },
    h('div', { class: 'rest' },
      h('p', { class: 'eyebrow' }, 'Hold'),
      ring,
      h('button', { class: 'btn btn-ghost', onclick: () => { countdown?.stop(); onDone(); } }, 'Finish early'),
    ),
  ));

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
  const { idx: exIdx, set: setIdx } = session.cursor;
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

  root.replaceChildren(h('div', { class: 'player' },
    h('div', { class: 'rest' },
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
    ),
  ));

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
  const anyWork = session.entries.some((e) => e.sets.some((s) => s.done));
  if (!anyWork) {
    clearActive();
    toast('Nothing logged — workout discarded.');
    location.hash = '#/';
    return;
  }
  saveSession({
    date: session.date,
    dayIdx: session.dayIdx,
    week: session.week,
    dayName: session.dayName,
    durationMin: Math.round((Date.now() - session.startedAt) / 60000),
    entries: session.entries,
    warmupDone: session.warmup.filter((i) => i.done).length,
    warmupTotal: session.warmup.length,
    cooldownDone: session.cooldown.filter((i) => i.done).length,
    cooldownTotal: session.cooldown.length,
    prs: detectPRs(session),
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
  const warm = session.warmup.filter((i) => i.done).length;
  const cool = session.cooldown.filter((i) => i.done).length;
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
      h('div', { class: 'summary-blocks' },
        h('p', { class: `note ${warm === session.warmup.length ? 'note-good' : ''}` },
          `Warm-up ${warm}/${session.warmup.length} · Stretching ${cool}/${session.cooldown.length}`),
      ),
      h('button', { class: 'btn btn-primary btn-block', onclick: () => finish(session, rerender) }, 'Save and finish'),
    ),
  ));
}
