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

const SLOT = (label, pool, sets, reps, rest, note) => ({ label, pool, sets, reps, rest, note });

const WARMUP_UPPER = [
  '30 seconds of arm circles, forward then backward',
  '10 slow band pull-aparts (or arm swings if no band handy)',
  '10 push-ups at an easy pace',
  '1 light set of the first exercise at roughly half your working weight',
];

const WARMUP_LOWER = [
  '30 seconds of marching on the spot',
  '10 bodyweight squats to full depth',
  '10 hip hinges with hands on your hips',
  '1 light set of the first exercise at roughly half your working weight',
];

const WARMUP_FULL = [
  '60 seconds of marching or jogging on the spot',
  '10 bodyweight squats and 10 arm circles',
  '10 hip hinges',
  '1 light set of the first exercise at roughly half your working weight',
];

export const SPLITS = {
  3: {
    id: 'full-body',
    name: 'Full Body ×3',
    summary: 'Three full-body sessions a week. Every muscle gets hit three times, which is the most efficient way to train on limited days.',
    schedule: [0, null, 1, null, 2, null, null], // Mon Wed Fri
    days: [
      {
        name: 'Full Body A', focus: 'Squat · Press · Row', warmup: WARMUP_FULL,
        slots: [
          SLOT('Squat pattern',       ['bb-back-squat', 'goblet-squat'],            4, [6, 10],  180),
          SLOT('Horizontal press',    ['bb-floor-press', 'db-floor-press'],         4, [8, 10],  150),
          SLOT('Horizontal pull',     ['bb-bent-row', 'db-single-row'],             4, [8, 10],  150),
          SLOT('Hip hinge',           ['bb-rdl', 'db-rdl'],                         3, [10, 12], 120),
          SLOT('Side delts',          ['lateral-raise'],                            3, [12, 20], 60),
          SLOT('Core',                ['ab-rollout', 'plank'],                      3, [8, 12],  75),
          SLOT('Triceps',             ['overhead-tri-ext', 'band-pushdown'],        3, [10, 15], 75),
        ],
      },
      {
        name: 'Full Body B', focus: 'Deadlift · Overhead · Pull', warmup: WARMUP_FULL,
        slots: [
          SLOT('Deadlift',            ['bb-deadlift', 'sumo-deadlift'],             4, [5, 6],   180),
          SLOT('Vertical press',      ['bb-ohp', 'db-shoulder-press'],              4, [8, 10],  150),
          SLOT('Single-leg',          ['reverse-lunge', 'split-squat'],             3, [10, 12], 90),
          SLOT('Vertical pull',       ['band-pulldown', 'db-pullover'],             3, [12, 15], 90),
          SLOT('Biceps',              ['bb-curl', 'hammer-curl'],                   3, [10, 12], 75),
          SLOT('Calves',              ['standing-calf-raise'],                      4, [12, 20], 60),
          SLOT('Core',                ['leg-raise', 'plank'],                       3, [10, 15], 60),
        ],
      },
      {
        name: 'Full Body C', focus: 'Quads · Volume upper', warmup: WARMUP_FULL,
        slots: [
          SLOT('Quad focus',          ['bb-front-squat', 'heels-elevated-squat'],   4, [8, 12],  150),
          SLOT('Horizontal press',    ['db-floor-press', 'deficit-push-up'],        4, [10, 12], 120),
          SLOT('Horizontal pull',     ['db-bent-row', 'pendlay-row'],               4, [10, 12], 120),
          SLOT('Glutes & hamstrings', ['glute-bridge', 'single-leg-rdl'],           3, [12, 15], 90),
          SLOT('Triceps',             ['overhead-tri-ext', 'skullcrusher'],         3, [10, 12], 75),
          SLOT('Rear delts',          ['reverse-flye', 'band-face-pull'],           3, [15, 20], 60),
          SLOT('Biceps',              ['hammer-curl', 'concentration-curl'],        3, [10, 12], 75),
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
        name: 'Upper A', focus: 'Heavy · Chest, Back, Shoulders, Arms', warmup: WARMUP_UPPER,
        slots: [
          SLOT('Heavy horizontal press', ['bb-floor-press', 'db-floor-press'],       4, [6, 8],   150),
          SLOT('Heavy horizontal pull',  ['bb-bent-row', 'pendlay-row'],             4, [6, 8],   150),
          SLOT('Vertical press',         ['bb-ohp', 'db-shoulder-press'],            3, [8, 10],  120),
          SLOT('Vertical pull',          ['band-pulldown', 'db-pullover'],           3, [12, 15], 90),
          SLOT('Side delts',             ['lateral-raise'],                          3, [12, 20], 60),
          SLOT('Biceps',                 ['bb-curl', 'db-curl'],                     3, [8, 12],  75),
          SLOT('Triceps',                ['overhead-tri-ext', 'close-grip-floor-press'], 3, [10, 12], 75),
        ],
      },
      {
        name: 'Lower A', focus: 'Heavy · Squat, Hinge, Core', warmup: WARMUP_LOWER,
        slots: [
          SLOT('Heavy squat',            ['bb-back-squat', 'bb-front-squat'],        4, [6, 8],   180),
          SLOT('Hip hinge',              ['bb-rdl', 'db-rdl'],                       4, [8, 10],  150),
          SLOT('Single-leg',             ['split-squat', 'reverse-lunge'],           3, [10, 12], 90),
          SLOT('Glutes',                 ['glute-bridge', 'single-leg-glute-bridge'], 3, [12, 15], 90),
          SLOT('Calves',                 ['standing-calf-raise', 'single-leg-calf-raise'], 4, [12, 20], 60),
          SLOT('Core — loaded',          ['ab-rollout', 'leg-raise'],                3, [8, 12],  75),
          SLOT('Core — hold',            ['plank', 'hollow-hold', 'superman'],       3, [30, 60], 60),
        ],
      },
      {
        name: 'Upper B', focus: 'Volume · Chest, Back, Shoulders, Arms', warmup: WARMUP_UPPER,
        slots: [
          SLOT('Horizontal press',       ['db-floor-press', 'deficit-push-up', 'push-up'], 4, [10, 12], 120),
          SLOT('Horizontal pull',        ['db-single-row', 'db-bent-row'],           4, [10, 12], 105),
          SLOT('Vertical press',         ['z-press', 'arnold-press'],                3, [10, 12], 105),
          SLOT('Rear delts',             ['reverse-flye', 'band-face-pull'],         3, [15, 20], 60),
          SLOT('Side delts',             ['lateral-raise'],                          3, [12, 20], 60),
          SLOT('Biceps',                 ['hammer-curl', 'concentration-curl'],      3, [10, 12], 75),
          SLOT('Triceps',                ['skullcrusher', 'band-pushdown', 'diamond-push-up'], 3, [10, 15], 75),
        ],
      },
      {
        name: 'Lower B', focus: 'Volume · Deadlift, Quads, Obliques', warmup: WARMUP_LOWER,
        slots: [
          SLOT('Deadlift',               ['bb-deadlift', 'sumo-deadlift'],           4, [5, 6],   180),
          SLOT('Quad focus',             ['goblet-squat', 'heels-elevated-squat'],   4, [10, 12], 120),
          SLOT('Single-leg',             ['reverse-lunge', 'split-squat'],           3, [10, 12], 90),
          SLOT('Hamstrings',             ['single-leg-rdl', 'band-ham-curl'],        3, [10, 12], 75),
          SLOT('Calves',                 ['seated-calf-raise', 'standing-calf-raise'], 4, [15, 20], 60),
          SLOT('Obliques',               ['russian-twist', 'pallof-press'],          3, [16, 24], 60),
          SLOT('Grip & traps',           ['farmers-carry', 'bb-shrug', 'reverse-curl'], 3, [12, 15], 60),
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
        name: 'Push', focus: 'Chest, Shoulders, Triceps', warmup: WARMUP_UPPER,
        slots: [
          SLOT('Heavy press',            ['bb-floor-press', 'db-floor-press'],       4, [6, 8],   150),
          SLOT('Vertical press',         ['bb-ohp', 'db-shoulder-press'],            4, [8, 10],  135),
          SLOT('Chest volume',           ['deficit-push-up', 'db-floor-flye'],       3, [10, 15], 90),
          SLOT('Side delts',             ['lateral-raise'],                          4, [12, 20], 60),
          SLOT('Triceps — overhead',     ['overhead-tri-ext'],                       3, [10, 12], 75),
          SLOT('Triceps — lockout',      ['band-pushdown', 'diamond-push-up'],       3, [12, 20], 60),
        ],
      },
      {
        name: 'Pull', focus: 'Back, Rear Delts, Biceps', warmup: WARMUP_UPPER,
        slots: [
          SLOT('Heavy row',              ['bb-bent-row', 'pendlay-row'],             4, [6, 8],   150),
          SLOT('Vertical pull',          ['band-pulldown', 'db-pullover'],           4, [12, 15], 105),
          SLOT('Single-arm row',         ['db-single-row'],                          3, [10, 12], 90),
          SLOT('Rear delts',             ['band-face-pull', 'reverse-flye'],         3, [15, 20], 60),
          SLOT('Biceps — barbell',       ['bb-curl', 'drag-curl'],                   3, [8, 12],  75),
          SLOT('Biceps — neutral',       ['hammer-curl'],                            3, [10, 12], 60),
          SLOT('Traps & grip',           ['bb-shrug', 'farmers-carry', 'reverse-curl'], 3, [12, 15], 60),
        ],
      },
      {
        name: 'Legs', focus: 'Quads, Hamstrings, Glutes, Calves', warmup: WARMUP_LOWER,
        slots: [
          SLOT('Heavy squat',            ['bb-back-squat', 'bb-front-squat'],        4, [6, 8],   180),
          SLOT('Hip hinge',              ['bb-rdl', 'db-rdl'],                       4, [8, 10],  150),
          SLOT('Single-leg',             ['split-squat', 'reverse-lunge'],           3, [10, 12], 90),
          SLOT('Glutes',                 ['glute-bridge'],                           3, [12, 15], 90),
          SLOT('Calves',                 ['standing-calf-raise'],                    4, [12, 20], 60),
          SLOT('Core',                   ['ab-rollout', 'leg-raise'],                3, [8, 12],  75),
        ],
      },
      {
        name: 'Upper', focus: 'Volume · Full upper body', warmup: WARMUP_UPPER,
        slots: [
          SLOT('Horizontal press',       ['db-floor-press', 'push-up'],              4, [10, 12], 120),
          SLOT('Horizontal pull',        ['db-bent-row', 'db-single-row'],           4, [10, 12], 105),
          SLOT('Vertical press',         ['z-press', 'arnold-press'],                3, [10, 12], 105),
          SLOT('Lat isolation',          ['db-pullover'],                            3, [12, 15], 90),
          SLOT('Rear delts',             ['reverse-flye'],                           3, [15, 20], 60),
          SLOT('Arms superset',          ['concentration-curl', 'skullcrusher'],     3, [10, 12], 75),
        ],
      },
      {
        name: 'Lower', focus: 'Volume · Deadlift, Quads, Core', warmup: WARMUP_LOWER,
        slots: [
          SLOT('Deadlift',               ['bb-deadlift', 'sumo-deadlift'],           4, [5, 6],   180),
          SLOT('Quad focus',             ['goblet-squat', 'heels-elevated-squat'],   4, [10, 12], 120),
          SLOT('Hamstrings',             ['single-leg-rdl', 'band-ham-curl'],        3, [10, 12], 90),
          SLOT('Calves',                 ['seated-calf-raise'],                      4, [15, 20], 60),
          SLOT('Obliques',               ['russian-twist', 'pallof-press'],          3, [16, 24], 60),
          SLOT('Core',                   ['dead-bug', 'bird-dog', 'hollow-hold'],    3, [10, 12], 45),
        ],
      },
    ],
  },
};

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
