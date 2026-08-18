// Weekly training splits.
//
// Each split schedules training days across the week so that every major muscle
// is trained at least twice — the frequency that consistently outperforms once
// per week for hypertrophy at matched weekly volume. Weekly set counts per
// muscle land in the 10–20 range, which is where the dose-response curve for
// growth is steepest before junk volume sets in.
//
// A "slot" is a role in the session (heavy horizontal press, single-leg work,
// rear delts…) rather than a fixed exercise. Each slot carries a pool of
// exercises that satisfy that role, and the plan generator rotates through the
// pool week by week. You get variety without the programme losing its shape.
//
// Every session is bracketed by a compulsory RAMP warm-up and a compulsory
// static-stretch cool-down; both live in data/mobility.js and are assembled
// into the session by plan.js.

const SLOT = (label, pool, sets, reps, rest, note) => ({ label, pool, sets, reps, rest, note });

export const SPLITS = {
  3: {
    id: 'full-body',
    name: 'Full Body ×3',
    summary: 'Three full-body sessions a week. Every muscle gets hit three times, which is the most efficient way to train on limited days.',
    schedule: [0, null, 1, null, 2, null, null], // Mon Wed Fri
    days: [
      {
        name: 'Full Body A', focus: 'Squat · Press · Row',
        slots: [
          SLOT('Squat pattern',       ['bb-back-squat', 'goblet-squat', 'zercher-squat'],            4, [6, 10],  180),
          SLOT('Horizontal press',    ['bb-floor-press', 'db-floor-press', 'squeeze-press'],         4, [8, 10],  150),
          SLOT('Horizontal pull',     ['bb-bent-row', 'db-single-row'],             4, [8, 10],  150),
          SLOT('Hip hinge',           ['bb-rdl', 'db-rdl', 'db-goblet-good-morning'],                         3, [10, 12], 120),
          SLOT('Side delts',          ['lateral-raise', 'db-scaption'],                            3, [12, 20], 60),
          SLOT('Core',                ['ab-rollout', 'plank'],                      3, [8, 12],  75),
          SLOT('Triceps',             ['overhead-tri-ext', 'band-pushdown'],        3, [10, 15], 75),
        ],
      },
      {
        name: 'Full Body B', focus: 'Deadlift · Overhead · Pull',
        slots: [
          SLOT('Deadlift',            ['bb-deadlift', 'sumo-deadlift'],             4, [5, 6],   180),
          SLOT('Vertical press',      ['bb-ohp', 'db-shoulder-press', 'bb-push-press', 'db-single-arm-press'],              4, [8, 10],  150),
          SLOT('Single-leg',          ['reverse-lunge', 'bulgarian-split-squat', 'lateral-lunge', 'step-up'],             3, [10, 12], 90),
          SLOT('Vertical pull',       ['band-pulldown', 'db-pullover'],             3, [12, 15], 90),
          SLOT('Biceps',              ['bb-curl', 'hammer-curl'],                   3, [10, 12], 75),
          SLOT('Calves',              ['standing-calf-raise'],                      4, [12, 20], 60),
          SLOT('Core',                ['leg-raise', 'plank'],                       3, [10, 15], 60),
        ],
      },
      {
        name: 'Full Body C', focus: 'Quads · Volume upper',
        slots: [
          SLOT('Quad focus',          ['bb-front-squat', 'heels-elevated-squat', 'db-front-squat'],   4, [8, 12],  150),
          SLOT('Horizontal press',    ['db-floor-press', 'deficit-push-up', 'bridge-press'],        4, [10, 12], 120),
          SLOT('Horizontal pull',     ['db-bent-row', 'pendlay-row', 'yates-row'],               4, [10, 12], 120),
          SLOT('Glutes & hamstrings', ['hip-thrust', 'single-leg-rdl', 'plie-squat'], 3, [12, 15], 90),
          SLOT('Triceps',             ['overhead-tri-ext', 'skullcrusher'],         3, [10, 12], 75),
          SLOT('Rear delts',          ['chair-reverse-flye', 'reverse-flye', 'band-face-pull', 'db-wide-row'],           3, [15, 20], 60),
          SLOT('Biceps',              ['hammer-curl', 'seated-curl', 'zottman-curl'],        3, [10, 12], 75),
        ],
      },
    ],
  },

  4: {
    id: 'upper-lower',
    name: 'Upper / Lower ×4',
    summary: 'The most reliable four-day structure there is. Each muscle is trained twice a week — once heavy for strength, once lighter with more volume for size.',
    schedule: [0, 1, null, 2, 3, null, null], // Mon Tue / Thu Fri
    days: [
      {
        name: 'Upper A', focus: 'Heavy · Chest, Back, Shoulders, Arms',
        slots: [
          SLOT('Heavy horizontal press', ['bb-floor-press', 'db-floor-press', 'squeeze-press'],       4, [6, 8],   150),
          SLOT('Heavy horizontal pull',  ['bb-bent-row', 'pendlay-row', 'yates-row'],             4, [6, 8],   150),
          SLOT('Vertical press',         ['bb-ohp', 'db-shoulder-press', 'bb-push-press', 'db-single-arm-press'],            3, [8, 10],  120),
          SLOT('Vertical pull',          ['band-pulldown', 'db-pullover'],           3, [12, 15], 90),
          SLOT('Side delts',             ['lateral-raise', 'db-scaption'],           3, [12, 20], 60),
          SLOT('Biceps',                 ['bb-curl', 'db-curl', 'zottman-curl'],                     3, [8, 12],  75),
          SLOT('Triceps',                ['overhead-tri-ext', 'close-grip-floor-press'], 3, [10, 12], 75),
        ],
      },
      {
        name: 'Lower A', focus: 'Heavy · Squat, Hinge, Core',
        slots: [
          SLOT('Heavy squat',            ['bb-back-squat', 'bb-front-squat', 'zercher-squat', 'db-front-squat'],        4, [6, 8],   180),
          SLOT('Hip hinge',              ['bb-rdl', 'db-rdl', 'db-goblet-good-morning'],                       4, [8, 10],  150),
          SLOT('Single-leg',             ['bulgarian-split-squat', 'split-squat', 'db-walking-lunge', 'step-up'],           3, [10, 12], 90),
          SLOT('Glutes',                 ['hip-thrust', 'glute-bridge', 'single-leg-glute-bridge'], 3, [12, 15], 90),
          SLOT('Calves',                 ['standing-calf-raise', 'single-leg-calf-raise', 'bb-calf-raise'], 4, [12, 20], 60),
          SLOT('Core — loaded',          ['ab-rollout', 'leg-raise'],                3, [8, 12],  75),
          SLOT('Core — hold',            ['plank', 'hollow-hold', 'superman'],       3, [30, 60], 60),
        ],
      },
      {
        name: 'Upper B', focus: 'Volume · Chest, Back, Shoulders, Arms',
        slots: [
          SLOT('Horizontal press',       ['db-floor-press', 'decline-push-up', 'bridge-press', 'squeeze-press'], 4, [10, 12], 120),
          SLOT('Horizontal pull',        ['chair-row', 'db-single-row', 'db-bent-row'],           4, [10, 12], 105),
          SLOT('Vertical press',         ['seated-db-press', 'arnold-press', 'z-press'],                3, [10, 12], 105),
          SLOT('Rear delts',             ['chair-reverse-flye', 'reverse-flye', 'band-face-pull', 'db-wide-row'],         3, [15, 20], 60),
          SLOT('Side delts',             ['lateral-raise', 'db-scaption'],           3, [12, 20], 60),
          SLOT('Biceps',                 ['hammer-curl', 'seated-curl', 'zottman-curl'],      3, [10, 12], 75),
          SLOT('Triceps',                ['skullcrusher', 'chair-dip', 'overhead-tri-ext'], 3, [10, 15], 75),
        ],
      },
      {
        name: 'Lower B', focus: 'Volume · Deadlift, Quads, Obliques',
        slots: [
          SLOT('Deadlift',               ['bb-deadlift', 'sumo-deadlift'],           4, [5, 6],   180),
          SLOT('Quad focus',             ['goblet-squat', 'heels-elevated-squat', 'plie-squat', 'cossack-squat'],   4, [10, 12], 120),
          SLOT('Single-leg',             ['reverse-lunge', 'bulgarian-split-squat', 'lateral-lunge', 'step-up'],           3, [10, 12], 90),
          SLOT('Hamstrings',             ['single-leg-rdl', 'band-ham-curl', 'db-goblet-good-morning'],        3, [10, 12], 75),
          SLOT('Calves',                 ['seated-calf-raise', 'standing-calf-raise', 'bb-calf-raise'], 4, [15, 20], 60),
          SLOT('Obliques',               ['russian-twist', 'pallof-press', 'db-side-bend', 'suitcase-carry'],          3, [16, 24], 60),
          SLOT('Grip & traps',           ['farmers-carry', 'bb-shrug', 'bb-high-pull', 'waiter-walk'], 3, [12, 15], 60),
        ],
      },
    ],
  },

  5: {
    id: 'ppl-ul',
    name: 'Push / Pull / Legs + Upper / Lower ×5',
    summary: 'Five days for when you have the time and recovery. Push, pull and legs are trained specifically, then an upper and a lower day add the second weekly exposure.',
    schedule: [0, 1, 2, null, 3, 4, null], // Mon Tue Wed / Fri Sat
    days: [
      {
        name: 'Push', focus: 'Chest, Shoulders, Triceps',
        slots: [
          SLOT('Heavy press',            ['bb-floor-press', 'db-floor-press', 'squeeze-press'],       4, [6, 8],   150),
          SLOT('Vertical press',         ['bb-ohp', 'db-shoulder-press', 'bb-push-press', 'db-single-arm-press'],            4, [8, 10],  135),
          SLOT('Chest volume',           ['deficit-push-up', 'db-floor-flye'],       3, [10, 15], 90),
          SLOT('Side delts',             ['lateral-raise', 'db-scaption'],                          4, [12, 20], 60),
          SLOT('Triceps — overhead',     ['overhead-tri-ext'],                       3, [10, 12], 75),
          SLOT('Triceps — lockout',      ['band-pushdown', 'diamond-push-up'],       3, [12, 20], 60),
        ],
      },
      {
        name: 'Pull', focus: 'Back, Rear Delts, Biceps',
        slots: [
          SLOT('Heavy row',              ['bb-bent-row', 'pendlay-row', 'yates-row'],             4, [6, 8],   150),
          SLOT('Vertical pull',          ['band-pulldown', 'db-pullover'],           4, [12, 15], 105),
          SLOT('Single-arm row',         ['db-single-row'],                          3, [10, 12], 90),
          SLOT('Rear delts',             ['chair-reverse-flye', 'band-face-pull', 'reverse-flye', 'db-wide-row'],         3, [15, 20], 60),
          SLOT('Biceps — barbell',       ['bb-curl', 'drag-curl'],                   3, [8, 12],  75),
          SLOT('Biceps — neutral',       ['hammer-curl'],                            3, [10, 12], 60),
          SLOT('Traps & grip',           ['bb-shrug', 'db-shrug', 'bb-high-pull', 'suitcase-carry'], 3, [12, 15], 60),
        ],
      },
      {
        name: 'Legs', focus: 'Quads, Hamstrings, Glutes, Calves',
        slots: [
          SLOT('Heavy squat',            ['bb-back-squat', 'bb-front-squat', 'zercher-squat', 'db-front-squat'],        4, [6, 8],   180),
          SLOT('Hip hinge',              ['bb-rdl', 'db-rdl', 'db-goblet-good-morning'],                       4, [8, 10],  150),
          SLOT('Single-leg',             ['bulgarian-split-squat', 'split-squat', 'db-walking-lunge', 'step-up'],           3, [10, 12], 90),
          SLOT('Glutes',                 ['hip-thrust', 'glute-bridge', 'plie-squat'], 3, [12, 15], 90),
          SLOT('Calves',                 ['standing-calf-raise'],                    4, [12, 20], 60),
          SLOT('Core',                   ['ab-rollout', 'leg-raise'],                3, [8, 12],  75),
        ],
      },
      {
        name: 'Upper', focus: 'Volume · Full upper body',
        slots: [
          SLOT('Horizontal press',       ['db-floor-press', 'decline-push-up', 'bridge-press'],              4, [10, 12], 120),
          SLOT('Horizontal pull',        ['chair-row', 'db-bent-row', 'db-single-row'],           4, [10, 12], 105),
          SLOT('Vertical press',         ['seated-db-press', 'arnold-press', 'z-press'],                3, [10, 12], 105),
          SLOT('Lat isolation',          ['db-pullover'],                            3, [12, 15], 90),
          SLOT('Rear delts',             ['reverse-flye'],                           3, [15, 20], 60),
          SLOT('Arms superset',          ['concentration-curl', 'skullcrusher'],     3, [10, 12], 75),
        ],
      },
      {
        name: 'Lower', focus: 'Volume · Deadlift, Quads, Core',
        slots: [
          SLOT('Deadlift',               ['bb-deadlift', 'sumo-deadlift'],           4, [5, 6],   180),
          SLOT('Quad focus',             ['goblet-squat', 'heels-elevated-squat', 'plie-squat', 'cossack-squat'],   4, [10, 12], 120),
          SLOT('Hamstrings',             ['single-leg-rdl', 'band-ham-curl', 'db-goblet-good-morning'],        3, [10, 12], 90),
          SLOT('Calves',                 ['seated-calf-raise'],                      4, [15, 20], 60),
          SLOT('Obliques',               ['russian-twist', 'pallof-press', 'db-side-bend', 'suitcase-carry'],          3, [16, 24], 60),
          SLOT('Core',                   ['dead-bug', 'bird-dog', 'turkish-get-up'],    3, [10, 12], 45),
        ],
      },
    ],
  },
};

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
