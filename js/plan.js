// Turns a split template into a concrete session for a given day, with a
// suggested working weight for every exercise.
//
// The progression model is double progression: hold the weight and climb the
// rep range, then add weight and drop back to the bottom of the range. It suits
// a home gym better than adding load every session, because the smallest jump
// you can make with real plates is often a large percentage of a light lift —
// going 10 kg → 12.5 kg on a curl is a 25% increase no one absorbs weekly.
// Climbing reps first bridges that gap.

import { SPLITS, DAY_NAMES } from './data/plans.js';
import { byId } from './data/exercises.js';
import { getSettings, weekNumber, lastPerformance, weekdayIndex, todayISO } from './state.js';
import { warmupFor, stretchesFor, blockSeconds } from './data/mobility.js';

/** Round a weight to something you can actually load with your plates. */
export function roundToIncrement(weight, increment) {
  if (!increment) return weight;
  return Math.round(weight / increment) * increment;
}

export function incrementFor(exercise) {
  const s = getSettings();
  switch (exercise.load) {
    case 'barbell': return s.barbellIncrement;
    case 'dumbbell-pair':
    case 'dumbbell-single': return s.dumbbellIncrement;
    default: return 0; // bands, bodyweight and timed holds progress by reps
  }
}

function ceilingFor(exercise) {
  const s = getSettings();
  if (exercise.load === 'barbell') return s.rodMax;
  if (exercise.load === 'dumbbell-pair' || exercise.load === 'dumbbell-single') return s.dumbbellMax;
  return Infinity;
}

/**
 * What to aim for today on one exercise, given what happened last time.
 * Returns { weight, reps, note, atCeiling } — weight is null for unloaded work.
 */
export function suggest(exercise, slot) {
  const [low, high] = slot.reps;
  const increment = incrementFor(exercise);
  const ceiling = ceilingFor(exercise);
  const loaded = increment > 0;
  const last = lastPerformance(exercise.id);
  const unit = exercise.timed ? 's' : 'reps';

  if (!last || !last.sets.length) {
    // Seed loaded lifts with the lightest sane starting point rather than zero:
    // an empty rod for barbell work, one small plate per dumbbell otherwise.
    const seed = exercise.load === 'barbell'
      ? getSettings().rodWeight
      : roundToIncrement(increment * 2, increment);
    return {
      weight: loaded ? seed : null,
      reps: low,
      loaded,
      note: loaded
        ? `First time on this. Start light — around ${seed} ${getSettings().unit} — and adjust as you go. Stop at ${low} reps even if you have more in you.`
        : `First time on this. Aim for ${low} ${unit} and see how it feels.`,
      firstTime: true,
    };
  }

  const weights = last.sets.map((s) => s.weight ?? 0);
  const repsHit = last.sets.map((s) => s.reps ?? 0);
  const topWeight = Math.max(...weights);
  const clearedRange = last.sets.length >= slot.sets && repsHit.every((r) => r >= high);

  if (!loaded) {
    // Unloaded work climbs by reps or seconds, without an upper bound.
    const target = clearedRange ? high + (exercise.timed ? 5 : 2) : Math.min(high, Math.min(...repsHit) + 1);
    return {
      weight: null,
      reps: target,
      loaded,
      note: clearedRange
        ? `You cleared ${high} ${unit} on every set. Push to ${target} today.`
        : `Last time: ${repsHit.join(', ')}. Add a rep wherever you can.`,
      last,
    };
  }

  if (clearedRange) {
    const next = roundToIncrement(topWeight + increment, increment);
    if (next > ceiling) {
      return {
        weight: topWeight,
        reps: high + 2,
        loaded,
        note: `You're at the ceiling your gear allows (${ceiling} ${getSettings().unit}). Keep the weight and push the reps higher instead.`,
        atCeiling: true,
        last,
      };
    }
    return {
      weight: next,
      reps: low,
      loaded,
      note: `You hit ${high} on every set last time. Go up to ${next} ${getSettings().unit} and reset to ${low} reps.`,
      levelUp: true,
      last,
    };
  }

  const weakest = Math.min(...repsHit);
  return {
    weight: topWeight,
    reps: Math.min(high, weakest + 1),
    loaded,
    note: `Last time: ${repsHit.join(', ')} @ ${topWeight} ${getSettings().unit}. Same weight — add a rep where you can, then the weight goes up.`,
    last,
  };
}

/** Pick this week's exercise for a slot, rotating through its pool. */
export function resolveSlot(slot, week) {
  const id = slot.pool[week % slot.pool.length];
  return byId[id] ?? byId[slot.pool[0]];
}

/**
 * Build the full session for a weekday index (Mon = 0), or return a rest day.
 */
export function sessionFor(dayIdx = weekdayIndex(), week = weekNumber()) {
  const split = SPLITS[getSettings().daysPerWeek] ?? SPLITS[4];
  const slotIdx = split.schedule[dayIdx];

  if (slotIdx === null || slotIdx === undefined) {
    return { rest: true, split, weekday: DAY_NAMES[dayIdx], dayIdx, week };
  }

  const day = split.days[slotIdx];
  const exercises = day.slots.map((slot) => {
    const exercise = resolveSlot(slot, week);
    return { slot, exercise, suggestion: suggest(exercise, slot) };
  });

  // Warm-up and cool-down are part of every session, not an optional extra.
  // The first working exercise is named in the ramp-up set so the potentiation
  // step tells you exactly what to do a light set of.
  const warmup = warmupFor(day.name).map((item) =>
    item.phase === 'Potentiate'
      ? {
          ...item,
          name: `Light set: ${exercises[0].exercise.name}`,
          pattern: exercises[0].exercise.pattern,
          // Show that exercise's own photograph, not a generic one.
          photoId: exercises[0].exercise.id,
        }
      : item);

  return {
    rest: false, split, day, dayIdx, week, weekday: DAY_NAMES[dayIdx], exercises,
    warmup,
    cooldown: stretchesFor(day.name),
  };
}

/** The next training day at or after `fromIdx`, wrapping into next week. */
export function nextTrainingDay(fromIdx = weekdayIndex()) {
  const split = SPLITS[getSettings().daysPerWeek] ?? SPLITS[4];
  for (let i = 1; i <= 7; i++) {
    const idx = (fromIdx + i) % 7;
    if (split.schedule[idx] !== null && split.schedule[idx] !== undefined) {
      return { dayIdx: idx, weekday: DAY_NAMES[idx], day: split.days[split.schedule[idx]], inDays: i };
    }
  }
  return null;
}

/** The week at a glance — used for the schedule strip on the home screen. */
export function weekOverview(week = weekNumber()) {
  const split = SPLITS[getSettings().daysPerWeek] ?? SPLITS[4];
  return split.schedule.map((slotIdx, dayIdx) => ({
    dayIdx,
    weekday: DAY_NAMES[dayIdx],
    short: DAY_NAMES[dayIdx].slice(0, 3),
    day: slotIdx === null || slotIdx === undefined ? null : split.days[slotIdx],
  }));
}

/** Estimated duration in minutes: work time plus prescribed rest. */
export function estimateMinutes(session) {
  if (session.rest) return 0;
  let seconds = 0;
  for (const { slot, exercise } of session.exercises) {
    const work = exercise.timed ? slot.reps[1] : slot.reps[1] * 3.5;
    seconds += slot.sets * (work + slot.rest);
  }
  seconds += blockSeconds(session.warmup ?? []) + blockSeconds(session.cooldown ?? []);
  return Math.round(seconds / 60);
}

/** Weekly set count per muscle, so the home screen can show the balance. */
export function weeklyVolume(week = weekNumber()) {
  const split = SPLITS[getSettings().daysPerWeek] ?? SPLITS[4];
  const totals = {};
  for (const day of split.days) {
    for (const slot of day.slots) {
      const ex = resolveSlot(slot, week);
      for (const m of ex.primary) totals[m] = (totals[m] ?? 0) + slot.sets;
      for (const m of ex.secondary ?? []) totals[m] = (totals[m] ?? 0) + slot.sets * 0.5;
    }
  }
  return totals;
}

export { todayISO };
