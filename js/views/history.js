// Training history: what you have done, what you have beaten, and whether the
// weekly workload is actually going anywhere.

import { h, relativeDate } from '../ui.js';
import { getSessions, getSettings, epley } from '../state.js';
import { byId } from '../data/exercises.js';
import { openExercise } from '../components/exercise-sheet.js';

const NS = 'http://www.w3.org/2000/svg';

function sessionVolume(session) {
  return session.entries.reduce((total, e) =>
    total + e.sets.filter((s) => s.done).reduce((v, s) => v + (s.weight ?? 0) * s.reps, 0), 0);
}

/** Volume per ISO week, oldest first, for the trend chart. */
function volumeByWeek(sessions) {
  const buckets = new Map();
  for (const s of sessions) {
    const d = new Date(s.date + 'T00:00:00');
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + sessionVolume(s));
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-10);
}

function volumeChart(sessions) {
  const data = volumeByWeek(sessions);
  if (data.length < 2) return null;

  const max = Math.max(...data.map(([, v]) => v)) || 1;
  const W = 320, H = 120, pad = 8;
  const barW = (W - pad * 2) / data.length;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'chart');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Weekly training volume');

  data.forEach(([week, value], i) => {
    const height = Math.max(2, (value / max) * (H - 28));
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', pad + i * barW + barW * 0.18);
    rect.setAttribute('y', H - 18 - height);
    rect.setAttribute('width', barW * 0.64);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', 3);
    rect.setAttribute('class', i === data.length - 1 ? 'chart-bar is-current' : 'chart-bar');
    const title = document.createElementNS(NS, 'title');
    title.textContent = `Week of ${week}: ${Math.round(value).toLocaleString()} ${getSettings().unit}`;
    rect.appendChild(title);
    svg.appendChild(rect);
  });

  const axis = document.createElementNS(NS, 'line');
  axis.setAttribute('x1', pad); axis.setAttribute('x2', W - pad);
  axis.setAttribute('y1', H - 17); axis.setAttribute('y2', H - 17);
  axis.setAttribute('class', 'chart-axis');
  svg.appendChild(axis);

  return svg;
}

/** Best estimated 1RM per exercise across all history. */
function personalBests(sessions) {
  const best = new Map();
  for (const s of sessions) {
    for (const e of s.entries) {
      for (const set of e.sets) {
        if (!set.done || !set.weight || !set.reps) continue;
        const value = epley(set.weight, set.reps);
        const current = best.get(e.exerciseId);
        if (!current || value > current.e1rm) {
          best.set(e.exerciseId, { e1rm: value, weight: set.weight, reps: set.reps, date: s.date });
        }
      }
    }
  }
  return [...best.entries()]
    .map(([id, v]) => ({ exercise: byId[id], ...v }))
    .filter((r) => r.exercise)
    .sort((a, b) => b.e1rm - a.e1rm);
}

function sessionCard(session) {
  const unit = getSettings().unit;
  const done = session.entries.filter((e) => e.sets.some((s) => s.done));

  return h('details', { class: 'session-card' },
    h('summary', {},
      h('div', {},
        h('strong', {}, session.dayName),
        h('span', { class: 'muted' }, ` · ${relativeDate(session.date)}`),
      ),
      h('span', { class: 'muted small' },
        `${done.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0)} sets`,
        session.durationMin ? ` · ${session.durationMin} min` : '',
      ),
    ),
    session.prs?.length > 0 && h('p', { class: 'note note-good' },
      `Personal best: ${session.prs.map((p) => byId[p.exerciseId]?.name ?? p.exerciseId).join(', ')}`),
    h('ul', { class: 'log-list' }, done.map((e) => {
      const exercise = byId[e.exerciseId];
      return h('li', { onclick: () => exercise && openExercise(exercise) },
        h('span', { class: 'ex-name' }, exercise?.name ?? e.exerciseId),
        h('span', { class: 'muted' }, e.sets.filter((s) => s.done)
          .map((s) => (s.weight ? `${s.reps}×${s.weight}${unit}` : `${s.reps}${exercise?.timed ? 's' : ''}`))
          .join('  ·  ')),
      );
    })),
  );
}

export function renderHistory(root, params) {
  const sessions = [...getSessions()].reverse();
  const unit = getSettings().unit;
  const justFinished = params?.get('justfinished') === '1';

  if (!sessions.length) {
    root.replaceChildren(
      h('header', { class: 'page-head' }, h('h1', {}, 'History')),
      h('div', { class: 'empty' },
        h('p', {}, 'Nothing logged yet.'),
        h('p', { class: 'muted' }, 'Finish a workout and it will show up here, along with your personal bests and weekly volume.'),
        h('a', { class: 'btn btn-primary', href: '#/' }, 'Go to today'),
      ),
    );
    return;
  }

  const totalVolume = sessions.reduce((n, s) => n + sessionVolume(s), 0);
  const bests = personalBests(sessions).slice(0, 8);
  const chart = volumeChart([...sessions].reverse());

  root.replaceChildren(
    h('header', { class: 'page-head' },
      h('h1', {}, 'History'),
      justFinished && h('p', { class: 'note note-good' }, 'Session saved. Well done.'),
    ),

    h('div', { class: 'stat-row' },
      h('div', { class: 'stat' }, h('strong', {}, sessions.length), h('span', {}, 'sessions')),
      h('div', { class: 'stat' }, h('strong', {}, Math.round(totalVolume / 1000).toLocaleString()), h('span', {}, `tonnes lifted`)),
      h('div', { class: 'stat' }, h('strong', {}, bests.length), h('span', {}, 'lifts tracked')),
    ),

    chart && h('section', { class: 'card' },
      h('h3', {}, 'Weekly volume'),
      h('p', { class: 'muted small' }, `Total ${unit} moved per week. A gently rising line over months is the goal — not a jagged one.`),
      chart,
    ),

    bests.length > 0 && h('section', { class: 'card' },
      h('h3', {}, 'Personal bests'),
      h('p', { class: 'muted small' }, 'Estimated one-rep max, calculated with the Epley formula.'),
      h('ul', { class: 'pb-list' }, bests.map((b) => h('li', { onclick: () => openExercise(b.exercise) },
        h('span', { class: 'ex-name' }, b.exercise.name),
        h('span', {},
          h('strong', {}, `${Math.round(b.e1rm * 2) / 2} ${unit}`),
          h('span', { class: 'muted small' }, ` from ${b.reps}×${b.weight}${unit}`),
        ),
      ))),
    ),

    h('section', { class: 'card' },
      h('h3', {}, 'Sessions'),
      h('div', { class: 'session-list' }, sessions.map(sessionCard)),
    ),
  );
}
