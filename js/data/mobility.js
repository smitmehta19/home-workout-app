// Warm-ups and cool-downs. Both are compulsory parts of every session — they
// are built into the guided player, not offered as an optional extra.
//
// The warm-up follows RAMP: Raise body temperature, Activate the muscles you
// are about to load, Mobilise the joints through the ranges the session needs,
// then Potentiate with a light ramp-up set of the first exercise. It runs about
// eight minutes.
//
// The cool-down is static stretching, held 30 seconds a side. Static work is
// deliberately placed AFTER training and never before it: stretching a cold
// muscle to length ahead of lifting measurably reduces force output, while the
// same stretching done on warm tissue is where flexibility is actually gained.

const RAISE = 'Raise', ACTIVATE = 'Activate', MOBILISE = 'Mobilise', POTENTIATE = 'Potentiate';

const W = (id, name, phase, opts) => ({ id, name, phase, ...opts });

const SHARED_RAISE = [
  W('march', 'March or jog on the spot', RAISE, {
    seconds: 60, pattern: 'carry',
    cue: 'Brisk but easy. You want warm and slightly breathing harder, not tired.',
  }),
];

const UPPER_WARMUP = [
  ...SHARED_RAISE,
  W('arm-circles', 'Arm circles', RAISE, {
    seconds: 40, pattern: 'lateral-raise',
    cue: 'Twenty seconds forward, twenty back. Start small and let the circles grow.',
  }),
  W('pull-apart-warm', 'Band pull-aparts', ACTIVATE, {
    reps: 15, pattern: 'pull-apart',
    cue: 'Straight arms, squeeze the shoulder blades together. Wakes up the upper back before you press.',
  }),
  W('scap-pushup', 'Scapular push-ups', ACTIVATE, {
    reps: 10, pattern: 'pushup',
    cue: 'Arms stay straight. Only the shoulder blades move — pinch together, then push apart.',
  }),
  W('pass-through', 'Shoulder pass-throughs with the empty rod', MOBILISE, {
    reps: 10, pattern: 'pull-apart',
    cue: 'Wide grip, arms straight, take the bar from your thighs to behind you. Widen the grip if it pinches.',
  }),
  W('cat-cow', 'Cat–cow', MOBILISE, {
    reps: 8, pattern: 'bird-dog',
    cue: 'On all fours. Round the spine fully, then arch it fully. Breathe with it.',
  }),
  W('t-rotation', 'Thoracic rotation', MOBILISE, {
    reps: 6, perSide: true, pattern: 'twist',
    cue: 'On all fours, hand behind your head, open the elbow to the ceiling and follow it with your eyes.',
  }),
  W('ramp-set-upper', 'Light set of your first exercise', POTENTIATE, {
    reps: 8, pattern: 'floor-press',
    cue: 'Roughly half your working weight for 8 easy reps. This primes the exact movement you are about to load.',
  }),
];

const LOWER_WARMUP = [
  ...SHARED_RAISE,
  W('leg-swings', 'Leg swings', RAISE, {
    reps: 10, perSide: true, pattern: 'single-leg-rdl',
    cue: 'Hold a wall. Swing front to back, relaxed, letting the range grow each rep.',
  }),
  W('glute-bridge-warm', 'Bodyweight glute bridges', ACTIVATE, {
    reps: 15, pattern: 'glute-bridge',
    cue: 'Squeeze hard at the top. Gets the glutes firing so your lower back does not take over later.',
  }),
  W('bird-dog-warm', 'Bird dog', ACTIVATE, {
    reps: 8, perSide: true, pattern: 'bird-dog',
    cue: 'Slow. Keep the hips square and the lower back still.',
  }),
  W('bw-squat', 'Bodyweight squats to full depth', MOBILISE, {
    reps: 10, pattern: 'squat',
    cue: 'As deep as you comfortably go. Pause a beat at the bottom of the last few.',
  }),
  W('hip-9090', '90/90 hip rotations', MOBILISE, {
    reps: 6, perSide: true, pattern: 'twist',
    cue: 'Sit with both knees bent at 90°, drop them side to side without using your hands.',
  }),
  W('ankle-rock', 'Ankle rocks', MOBILISE, {
    reps: 10, perSide: true, pattern: 'split-squat',
    cue: 'Half-kneeling, drive the front knee forward over the toes with the heel glued down.',
  }),
  W('ramp-set-lower', 'Light set of your first exercise', POTENTIATE, {
    reps: 8, pattern: 'squat',
    cue: 'Roughly half your working weight for 8 easy reps. Grooves the pattern before it gets heavy.',
  }),
];

const FULL_WARMUP = [
  ...SHARED_RAISE,
  W('arm-circles', 'Arm circles', RAISE, {
    seconds: 40, pattern: 'lateral-raise',
    cue: 'Twenty seconds forward, twenty back.',
  }),
  W('glute-bridge-warm', 'Bodyweight glute bridges', ACTIVATE, {
    reps: 15, pattern: 'glute-bridge',
    cue: 'Squeeze hard at the top.',
  }),
  W('pull-apart-warm', 'Band pull-aparts', ACTIVATE, {
    reps: 15, pattern: 'pull-apart',
    cue: 'Straight arms, squeeze the shoulder blades together.',
  }),
  W('bw-squat', 'Bodyweight squats to full depth', MOBILISE, {
    reps: 10, pattern: 'squat',
    cue: 'As deep as you comfortably go.',
  }),
  W('cat-cow', 'Cat–cow', MOBILISE, {
    reps: 8, pattern: 'bird-dog',
    cue: 'Round the spine fully, then arch it fully.',
  }),
  W('worlds-greatest', "World's greatest stretch", MOBILISE, {
    reps: 5, perSide: true, pattern: 'split-squat',
    cue: 'Deep lunge, drop the opposite elbow inside the front foot, then rotate that arm to the ceiling.',
  }),
  W('ramp-set-full', 'Light set of your first exercise', POTENTIATE, {
    reps: 8, pattern: 'squat',
    cue: 'Roughly half your working weight for 8 easy reps.',
  }),
];

const S = (id, name, seconds, cue, opts = {}) => ({ id, name, seconds, cue, ...opts });

const UPPER_STRETCH = [
  S('chest-wall', 'Doorway chest stretch', 30, 'Forearm flat on a door frame at shoulder height, turn your body away until you feel the chest open.', { perSide: true, pattern: 'pull-apart' }),
  S('cross-body', 'Cross-body shoulder stretch', 30, 'Pull the arm across your chest with the opposite hand. Keep the shoulder down, not shrugged.', { perSide: true, pattern: 'pull-apart' }),
  S('tri-overhead', 'Overhead triceps stretch', 30, 'Hand behind your head reaching down your spine, gently press the elbow back.', { perSide: true, pattern: 'triceps-overhead' }),
  S('childs-pose', "Child's pose with a lat reach", 40, 'Sit back onto your heels, walk both hands forward and left, then right. Breathe into the ribs.', { pattern: 'bird-dog' }),
  S('spinal-twist', 'Seated spinal twist', 30, 'Sit tall, cross one leg over, rotate toward the top knee and hold. Do not force it with the arm.', { perSide: true, pattern: 'twist' }),
  S('neck-side', 'Neck side stretch', 20, 'Ear toward shoulder, let the opposite arm hang heavy. Very gentle — no pulling.', { perSide: true, pattern: 'carry' }),
];

const LOWER_STRETCH = [
  S('quad-stand', 'Standing quad stretch', 30, 'Heel to glute, knees together, push the hip forward. Hold a wall for balance.', { perSide: true, pattern: 'carry' }),
  S('hamstring-seated', 'Seated hamstring stretch', 30, 'One leg straight, hinge from the hip with a flat back. Chest toward the knee, not the nose.', { perSide: true, pattern: 'rdl' }),
  S('figure-4', 'Figure-4 glute stretch', 30, 'On your back, ankle across the opposite knee, pull the far thigh toward you.', { perSide: true, pattern: 'glute-bridge' }),
  S('hip-flexor', 'Kneeling hip flexor stretch', 30, 'Half-kneeling, tuck the pelvis under, then press the hip forward. Undoes a day of sitting.', { perSide: true, pattern: 'split-squat' }),
  S('calf-wall', 'Calf stretch against a wall', 30, 'Back leg straight, heel down, lean into the wall. Then repeat with that knee slightly bent.', { perSide: true, pattern: 'calf-raise' }),
  S('butterfly', 'Butterfly (adductor) stretch', 40, 'Soles together, let the knees fall open. Sit tall rather than rounding forward.', { pattern: 'wide-squat' }),
  S('childs-pose', "Child's pose", 40, 'Knees wide, hips back to the heels, arms long. Slow breathing to finish.', { pattern: 'bird-dog' }),
];

const FULL_STRETCH = [
  S('chest-wall', 'Doorway chest stretch', 30, 'Forearm on the door frame, turn away until the chest opens.', { perSide: true, pattern: 'pull-apart' }),
  S('tri-overhead', 'Overhead triceps stretch', 30, 'Hand down your spine, press the elbow gently back.', { perSide: true, pattern: 'triceps-overhead' }),
  S('quad-stand', 'Standing quad stretch', 30, 'Heel to glute, knees together, hip pushed forward.', { perSide: true, pattern: 'carry' }),
  S('hamstring-seated', 'Seated hamstring stretch', 30, 'Hinge from the hip with a flat back.', { perSide: true, pattern: 'rdl' }),
  S('figure-4', 'Figure-4 glute stretch', 30, 'Ankle across the opposite knee, pull the far thigh in.', { perSide: true, pattern: 'glute-bridge' }),
  S('hip-flexor', 'Kneeling hip flexor stretch', 30, 'Tuck the pelvis, then press the hip forward.', { perSide: true, pattern: 'split-squat' }),
  S('spinal-twist', 'Seated spinal twist', 30, 'Rotate toward the top knee, sitting tall.', { perSide: true, pattern: 'twist' }),
  S('childs-pose', "Child's pose", 40, 'Hips to heels, arms long, slow breathing.', { pattern: 'bird-dog' }),
];

/** Pick the routine matching a session's emphasis. */
function routineKey(dayName = '') {
  const n = dayName.toLowerCase();
  if (n.includes('upper') || n.includes('push') || n.includes('pull')) return 'upper';
  if (n.includes('lower') || n.includes('leg')) return 'lower';
  return 'full';
}

const WARMUPS = { upper: UPPER_WARMUP, lower: LOWER_WARMUP, full: FULL_WARMUP };
const STRETCHES = { upper: UPPER_STRETCH, lower: LOWER_STRETCH, full: FULL_STRETCH };

export const warmupFor = (dayName) => WARMUPS[routineKey(dayName)];
export const stretchesFor = (dayName) => STRETCHES[routineKey(dayName)];

/** Rough duration of a warm-up or stretch block, in seconds. */
export const blockSeconds = (items) =>
  items.reduce((total, i) => total + (i.seconds ?? i.reps * 3) * (i.perSide ? 2 : 1) + 8, 0);

export const RAMP_PHASES = [RAISE, ACTIVATE, MOBILISE, POTENTIATE];
