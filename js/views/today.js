// Home screen: what you are training today, why, and a single button to start.

import { h } from '../ui.js';
import { sessionFor, nextTrainingDay, weekOverview, estimateMinutes } from '../plan.js';
import { weekdayIndex, weekNumber, getSessions, getActive, todayISO } from '../state.js';
import { openExercise, openDrill } from '../components/exercise-sheet.js';
import { muscleName } from '../data/muscles.js';
import { getSettings } from '../state.js';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function weekStrip(activeIdx) {
  return h('div', { class: 'week-strip' },
    weekOverview().map((d) => h('a', {
      class: `wk-day${d.dayIdx === activeIdx ? ' is-today' : ''}${d.day ? '' : ' is-rest'}`,
      href: d.day ? `#/workout?day=${d.dayIdx}&preview=1` : '#/',
      title: d.day ? d.day.name : 'Rest day',
    },
      h('span', { class: 'wk-name' }, d.short),
      h('span', { class: 'wk-dot' }),
      h('span', { class: 'wk-label' }, d.day ? d.day.name.replace(/ (A|B)$/, '$&') : 'Rest'),
    )),
  );
}

function exerciseRow(item, index) {
  const { slot, exercise, suggestion } = item;
  const unit = getSettings().unit;
  const target = exercise.timed
    ? `${slot.sets} × ${suggestion.reps}s`
    : `${slot.sets} × ${suggestion.reps}${exercise.unilateral ? ' / side' : ''}`;

  // An unloaded movement is bodyweight; a loaded one always names a number, so
  // "bodyweight" can never appear next to a barbell lift.
  const load = !suggestion.loaded
    ? 'bodyweight'
    : suggestion.firstTime
      ? `start ~${suggestion.weight} ${unit}`
      : `${suggestion.weight} ${unit}`;

  return h('li', { class: 'ex-row', onclick: () => openExercise(exercise) },
    h('span', { class: 'ex-index' }, index + 1),
    h('div', { class: 'ex-main' },
      h('span', { class: 'ex-name' }, exercise.name),
      h('span', { class: 'ex-slot' }, slot.label),
    ),
    h('div', { class: 'ex-target' },
      h('strong', {}, target),
      h('span', { class: `muted${suggestion.levelUp ? ' is-up' : ''}` }, suggestion.levelUp ? `↑ ${load}` : load),
    ),
  );
}

function streak() {
  const dates = new Set(getSessions().map((s) => s.date));
  let count = 0;
  const cursor = new Date();
  // Walk back day by day; rest days don't break a streak, two blank weeks do.
  for (let i = 0; i < 60; i++) {
    const iso = todayISO(cursor);
    if (dates.has(iso)) count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function renderToday(root) {
  const dayIdx = weekdayIndex();
  const session = sessionFor(dayIdx);
  const sessions = getSessions();
  const active = getActive();
  const doneToday = sessions.some((s) => s.date === todayISO());

  const header = h('header', { class: 'page-head' },
    h('p', { class: 'eyebrow' }, greeting()),
    h('h1', {}, session.rest ? 'Rest day' : session.day.name),
    h('p', { class: 'muted' },
      session.rest
        ? 'Recovery is when the adaptation actually happens. Take it.'
        : session.day.focus,
    ),
  );

  const stats = h('div', { class: 'stat-row' },
    h('div', { class: 'stat' }, h('strong', {}, sessions.length), h('span', {}, 'sessions logged')),
    h('div', { class: 'stat' }, h('strong', {}, `W${weekNumber() + 1}`), h('span', {}, 'programme week')),
    h('div', { class: 'stat' }, h('strong', {}, streak()), h('span', {}, 'days trained (60d)')),
  );

  let main;

  if (session.rest) {
    const next = nextTrainingDay(dayIdx);
    main = h('section', { class: 'card card-rest' },
      h('div', { class: 'rest-mark' }, '○'),
      h('h2', {}, 'Nothing scheduled today'),
      h('p', { class: 'muted' },
        next ? `Next up is ${next.day.name} on ${next.weekday} — ${next.day.focus}.` : 'Set your training days in Settings.'),
      h('div', { class: 'card-actions' },
        next && h('a', { class: 'btn btn-ghost', href: `#/workout?day=${next.dayIdx}&preview=1` }, `Preview ${next.day.name}`),
        next && h('a', { class: 'btn btn-primary', href: `#/workout?day=${next.dayIdx}` }, 'Train it anyway'),
      ),
    );
  } else {
    main = h('section', { class: 'card card-today' },
      h('div', { class: 'today-meta' },
        h('span', {}, `${session.exercises.length} exercises`),
        h('span', {}, '·'),
        h('span', {}, `~${estimateMinutes(session)} min`),
        h('span', {}, '·'),
        h('span', {}, `${session.exercises.reduce((n, e) => n + e.slot.sets, 0)} sets`),
        h('span', {}, '·'),
        h('span', {}, 'warm-up + stretch included'),
      ),
      doneToday && !active && h('p', { class: 'note note-good' }, 'You already logged a session today. Going again is up to you.'),
      active && h('p', { class: 'note' }, 'You have a workout in progress.'),
      h('a', { class: 'btn btn-primary btn-block btn-start', href: `#/workout?day=${dayIdx}` },
        active ? 'Resume workout' : 'Start workout'),
      h('ol', { class: 'ex-list' }, session.exercises.map(exerciseRow)),
      // Warm-up and stretching are shown as fixed parts of the session, not as
      // something to fold away and forget.
      h('div', { class: 'bookends' },
        h('div', { class: 'bookend' },
          h('span', { class: 'bookend-tag' }, 'Always first'),
          h('strong', {}, `Warm-up · ${session.warmup.length} drills`),
          h('div', { class: 'drill-chips' }, session.warmup.map((w) =>
            h('button', { class: 'drill-chip', onclick: () => openDrill(w, 'warmup') },
              w.name.replace(/^Light set: .*/, 'Ramp-up set')))),
        ),
        h('div', { class: 'bookend' },
          h('span', { class: 'bookend-tag' }, 'Always last'),
          h('strong', {}, `Stretching · ${session.cooldown.length} holds`),
          h('div', { class: 'drill-chips' }, session.cooldown.map((c) =>
            h('button', { class: 'drill-chip', onclick: () => openDrill(c, 'stretch') }, c.name))),
        ),
      ),
    );
  }

  const split = session.split;
  const footer = h('section', { class: 'card card-quiet' },
    h('h3', {}, split.name),
    h('p', { class: 'muted small' }, split.summary),
    weekStrip(dayIdx),
  );

  root.replaceChildren(header, stats, main, footer);
}
