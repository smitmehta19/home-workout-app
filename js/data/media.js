// Photo guidance for movements, sourced from the Free Exercise DB.
//
//   https://github.com/yuhonas/free-exercise-db
//
// Each entry there ships two photographs — the start and end of the movement —
// which the app crossfades so you can see the actual positions rather than only
// a drawn figure.
//
// The images are LINKED, never copied into this repository. That keeps the
// provenance with the source project, and means dropping the integration is a
// one-line change if its licensing is ever challenged. The project declares
// itself Unlicense / public domain, though it carries no LICENSE file at its
// root and the origin of the photographs has been questioned in its issue
// tracker, so treat the credit as required rather than optional.
//
// Anything not listed here — or whose photo fails to load — falls back to the
// drawn animation in components/figure.js, which always works offline.

// jsDelivr is a real CDN and is the primary source; raw.githubusercontent is
// the same files but is not built for hotlinking and can be throttled, so it is
// only used if the CDN request fails.
const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';
const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export const MEDIA_CREDIT = {
  name: 'Free Exercise DB',
  url: 'https://github.com/yuhonas/free-exercise-db',
};

/** Our movement id → the Free Exercise DB entry that demonstrates it. */
export const PHOTO_IDS = {
  // ── pressing ──
  'db-floor-press': 'Dumbbell_Floor_Press',
  'bb-floor-press': 'Floor_Press',
  'close-grip-floor-press': 'Floor_Press',
  'db-floor-flye': 'Dumbbell_Flyes',
  'push-up': 'Pushups',
  'deficit-push-up': 'Push-Ups_With_Feet_Elevated',
  'diamond-push-up': 'Push-Ups_-_Close_Triceps_Position',
  // ── pulling ──
  'bb-bent-row': 'Bent_Over_Barbell_Row',
  'pendlay-row': 'Bent_Over_Barbell_Row',
  'db-single-row': 'One-Arm_Dumbbell_Row',
  'db-bent-row': 'Bent_Over_Two-Dumbbell_Row',
  'yates-row': 'Reverse_Grip_Bent-Over_Rows',
  'renegade-row': 'Alternating_Renegade_Row',
  'db-pullover': 'Bent-Arm_Dumbbell_Pullover',
  'reverse-flye': 'Reverse_Flyes',
  'band-face-pull': 'Face_Pull',
  'band-pull-apart': 'Band_Pull_Apart',
  'bb-shrug': 'Barbell_Shrug',
  'db-shrug': 'Dumbbell_Shrug',
  'superman': 'Superman',
  // ── shoulders ──
  'bb-ohp': 'Standing_Military_Press',
  'db-shoulder-press': 'Standing_Dumbbell_Press',
  'arnold-press': 'Arnold_Dumbbell_Press',
  'bb-push-press': 'Push_Press',
  'lateral-raise': 'Side_Lateral_Raise',
  'front-raise': 'Front_Dumbbell_Raise',
  'db-scaption': 'Dumbbell_Scaption',
  'db-external-rotation': 'External_Rotation',
  'upright-row': 'Upright_Barbell_Row',
  // ── arms ──
  'bb-curl': 'Barbell_Curl',
  'db-curl': 'Dumbbell_Bicep_Curl',
  'hammer-curl': 'Alternate_Hammer_Curl',
  'concentration-curl': 'Concentration_Curls',
  'drag-curl': 'Drag_Curl',
  'reverse-curl': 'Reverse_Barbell_Curl',
  'zottman-curl': 'Zottman_Curl',
  'wrist-curl': 'Seated_Dumbbell_Palms-Up_Wrist_Curl',
  'overhead-tri-ext': 'Standing_Dumbbell_Triceps_Extension',
  'skullcrusher': 'Lying_Triceps_Press',
  'band-pushdown': 'Triceps_Pushdown',
  'tri-kickback': 'Tricep_Dumbbell_Kickback',
  // ── legs ──
  'bb-back-squat': 'Barbell_Full_Squat',
  'bb-front-squat': 'Front_Barbell_Squat',
  'zercher-squat': 'Zercher_Squats',
  'goblet-squat': 'Goblet_Squat',
  'heels-elevated-squat': 'Goblet_Squat',
  'db-front-squat': 'Dumbbell_Squat',
  'plie-squat': 'Plie_Dumbbell_Squat',
  'split-squat': 'Dumbbell_Rear_Lunge',
  'reverse-lunge': 'Dumbbell_Rear_Lunge',
  'bb-reverse-lunge': 'Barbell_Lunge',
  'db-walking-lunge': 'Dumbbell_Lunges',
  'bb-hack-squat': 'Barbell_Hack_Squat',
  'bb-deadlift': 'Barbell_Deadlift',
  'sumo-deadlift': 'Sumo_Deadlift',
  'bb-rdl': 'Romanian_Deadlift',
  'db-rdl': 'Romanian_Deadlift',
  'good-morning': 'Good_Morning',
  'db-goblet-good-morning': 'Good_Morning',
  'glute-bridge': 'Barbell_Glute_Bridge',
  'single-leg-glute-bridge': 'Single_Leg_Glute_Bridge',
  'band-ham-curl': 'Seated_Band_Hamstring_Curl',
  'band-glute-kickback': 'Glute_Kickback',
  'band-lateral-walk': 'Monster_Walk',
  'standing-calf-raise': 'Standing_Dumbbell_Calf_Raise',
  'bb-calf-raise': 'Standing_Barbell_Calf_Raise',
  'seated-calf-raise': 'Seated_Calf_Raise',
  'single-leg-calf-raise': 'Calf_Raise_On_A_Dumbbell',
  // ── full body and trunk ──
  'db-thruster': 'Kettlebell_Thruster',
  'db-clean-press': 'Clean_and_Press',
  'db-swing': 'One-Arm_Kettlebell_Swings',
  'turkish-get-up': 'Kettlebell_Turkish_Get-Up_Lunge_style',
  'db-windmill': 'Kettlebell_Windmill',
  'db-side-bend': 'Dumbbell_Side_Bend',
  'farmers-carry': 'Farmers_Walk',
  'suitcase-carry': 'Farmers_Walk',
  'plank': 'Plank',
  'side-plank': 'Side_Bridge',
  'ab-rollout': 'Barbell_Ab_Rollout',
  'dead-bug': 'Dead_Bug',
  'leg-raise': 'Flat_Bench_Lying_Leg_Raise',
  'russian-twist': 'Russian_Twist',
  'weighted-crunch': 'Crunches',
  'pallof-press': 'Pallof_Press',
  'mountain-climber': 'Mountain_Climbers',
  // chair-supported
  'chair-reverse-flye': 'Seated_Bent-Over_Rear_Delt_Raise',
  'chair-row': 'Dumbbell_Incline_Row',
  'bulgarian-split-squat': 'One_Leg_Barbell_Squat',
  'hip-thrust': 'Barbell_Hip_Thrust',
  'decline-push-up': 'Decline_Push-Up',
  'incline-push-up': 'Incline_Push-Up',
  'chair-dip': 'Bench_Dips',
  'step-up': 'Dumbbell_Step_Ups',
  'seated-db-press': 'Seated_Dumbbell_Press',
  'seated-curl': 'Seated_Dumbbell_Curl',
  'hollow-hold': 'Plank',
  'bird-dog': 'Dead_Bug',
  'wall-sit': 'Sit_Squats',
  'waiter-walk': 'Farmers_Walk',
  'z-press': 'Seated_Dumbbell_Press',
  'squeeze-press': 'Close-Grip_Dumbbell_Press',
  'bridge-press': 'Dumbbell_Floor_Press',
  'pike-push-up': 'Handstand_Push-Ups',
  'band-chest-press': 'Cable_Chest_Press',
  'band-pulldown': 'Full_Range-Of-Motion_Lat_Pulldown',
  'bb-high-pull': 'Clean_Pull',
  'lateral-lunge': 'Barbell_Side_Split_Squat',
  'cossack-squat': 'Barbell_Side_Split_Squat',
  'db-wide-row': 'Barbell_Rear_Delt_Row',
  'db-single-arm-press': 'Dumbbell_One-Arm_Shoulder_Press',
  'single-leg-rdl': 'Kettlebell_One-Legged_Deadlift',

  // ── stretches ──
  'chest-wall': 'Chest_And_Front_Of_Shoulder_Stretch',
  'cross-body': 'Shoulder_Stretch',
  'tri-overhead': 'Triceps_Stretch',
  'childs-pose': 'Childs_Pose',
  'spinal-twist': 'Spinal_Stretch',
  'neck-side': 'Side_Neck_Stretch',
  'quad-stand': 'Standing_Elevated_Quad_Stretch',
  'hamstring-seated': 'Hamstring_Stretch',
  'figure-4': 'Ankle_On_The_Knee',
  'hip-flexor': 'Kneeling_Hip_Flexor',
  'calf-wall': 'Calf_Stretch_Hands_Against_Wall',
  'butterfly': 'Adductor',

  // ── warm-up drills ──
  'arm-circles': 'Arm_Circles',
  'pull-apart-warm': 'Band_Pull_Apart',
  'cat-cow': 'Cat_Stretch',
  'leg-swings': 'Front_Leg_Raises',
  'glute-bridge-warm': 'Butt_Lift_Bridge',
  'bw-squat': 'Bodyweight_Squat',
  'hip-9090': '90_90_Hamstring',
  'ankle-rock': 'Ankle_Circles',
  'worlds-greatest': 'Groiners',
  'march': 'Jogging_Treadmill',
  'scap-pushup': 'Pushups',
  'pass-through': 'Shoulder_Stretch',
  't-rotation': 'Torso_Rotation',
  'bird-dog-warm': 'Dead_Bug',
  'band-walk-warm': 'Monster_Walk',
  'band-hamstring': 'Lying_Hamstring',
};

// Movements with no exact entry in the photo library. The photograph shows the
// closest relative rather than the movement itself, so the detail sheet says so
// instead of quietly implying the picture is the exercise.
export const APPROXIMATE = new Set([
  'hollow-hold', 'bird-dog', 'bird-dog-warm', 'wall-sit', 'waiter-walk', 'z-press',
  'bridge-press', 'pike-push-up', 'band-chest-press', 'band-pulldown', 'lateral-lunge',
  'cossack-squat', 'single-leg-rdl', 'march', 'scap-pushup', 'pass-through',
  'band-walk-warm', 'suitcase-carry', 'heels-elevated-squat', 'pendlay-row', 'close-grip-floor-press',
  'db-goblet-good-morning', 'db-rdl', 'split-squat', 'db-front-squat', 'db-swing',
  'db-thruster', 'turkish-get-up', 'db-windmill', 'band-lateral-walk', 'db-walking-lunge',
]);

export const hasPhotos = (id) => Boolean(PHOTO_IDS[id]);
export const isApproximate = (id) => APPROXIMATE.has(id);

/**
 * The two frames — start and end of the movement. Each carries a CDN url and a
 * raw.githubusercontent url to retry with if the CDN fails.
 */
export function photoSources(id) {
  const key = PHOTO_IDS[id];
  if (!key) return null;
  return [0, 1].map((i) => ({ src: `${CDN}/${key}/${i}.jpg`, retry: `${RAW}/${key}/${i}.jpg` }));
}
