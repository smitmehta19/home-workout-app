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
  W('pass-through', 'Shoulder pass-throughs', MOBILISE, {
    reps: 10, pattern: 'pull-apart',
    cue: 'A band is better than the rod here — hold it wide, arms straight, and take it from your thighs to behind you. Widen your hands if it pinches.',
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
  W('band-walk-warm', 'Banded lateral walks', ACTIVATE, {
    reps: 12, perSide: true, pattern: 'wide-squat',
    cue: 'Band above the knees, quarter squat, step sideways against it. Switches on the side of the hip so the knees track properly once you load up.',
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
  S('band-hamstring', 'Lying hamstring stretch with a band', 30, 'On your back, band looped round the foot, leg raised and straight. Pull gently on the band and let the leg come toward you.', { perSide: true, pattern: 'leg-raise' }),
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
  S('band-hamstring', 'Lying hamstring stretch with a band', 30, 'Band round the foot, leg straight up, pull gently and let it travel toward you.', { perSide: true, pattern: 'leg-raise' }),
  S('figure-4', 'Figure-4 glute stretch', 30, 'Ankle across the opposite knee, pull the far thigh in.', { perSide: true, pattern: 'glute-bridge' }),
  S('hip-flexor', 'Kneeling hip flexor stretch', 30, 'Tuck the pelvis, then press the hip forward.', { perSide: true, pattern: 'split-squat' }),
  S('spinal-twist', 'Seated spinal twist', 30, 'Rotate toward the top knee, sitting tall.', { perSide: true, pattern: 'twist' }),
  S('childs-pose', "Child's pose", 40, 'Hips to heels, arms long, slow breathing.', { pattern: 'bird-dog' }),
];


// Full instructions for every drill, so a stretch can be opened and read the
// same way an exercise can. Merged into the routines below by id.
const DETAIL = {
  march: { steps: ['Drive the knees up to about hip height, alternating.', 'Swing the arms naturally.', 'Build from a walk to a brisk jog over the minute.'],
    avoid: ['Going hard enough to tire yourself before the session starts.'] },
  'arm-circles': { steps: ['Arms straight out to the sides at shoulder height.', 'Circle forward for twenty seconds, starting small and growing.', 'Reverse and circle backward for twenty.'],
    avoid: ['Shrugging the shoulders up toward the ears.'] },
  'pull-apart-warm': { steps: ['Hold a band at shoulder width, arms straight ahead.', 'Pull the hands apart until the band reaches your chest.', 'Return slowly.'],
    avoid: ['Bending the elbows, which turns it into a row.'] },
  'scap-pushup': { steps: ['Set up in a push-up position with the arms locked.', 'Without bending the elbows, let the chest sink as the shoulder blades pinch together.', 'Push the floor away so the blades spread apart.'],
    avoid: ['Bending the elbows — the arms stay straight throughout.'] },
  'pass-through': { steps: ['Hold the empty rod with a very wide overhand grip in front of your thighs.', 'Keeping the arms straight, raise it overhead and back behind you.', 'Return along the same path.'],
    avoid: ['Gripping too narrow. Widen the grip until it moves without pinching.'] },
  'cat-cow': { steps: ['On all fours, hands under shoulders and knees under hips.', 'Round the spine and tuck the chin.', 'Reverse: drop the belly, lift the chest and tailbone.'],
    avoid: ['Rushing. Move with your breath, one segment at a time.'] },
  't-rotation': { steps: ['On all fours, place one hand behind your head.', 'Rotate that elbow down toward the opposite wrist.', 'Open it up toward the ceiling, following with your eyes.'],
    avoid: ['Letting the hips rotate — the movement is in the upper back.'] },
  'leg-swings': { steps: ['Hold a wall for balance.', 'Swing one leg forward and back, relaxed.', 'Let the range grow with each swing.'],
    avoid: ['Forcing height early or arching the lower back to swing higher.'] },
  'glute-bridge-warm': { steps: ['Lie on your back, knees bent, feet flat.', 'Drive through the heels to lift the hips.', 'Squeeze the glutes hard at the top, then lower.'],
    avoid: ['Arching the lower back instead of finishing with the glutes.'] },
  'band-walk-warm': { steps: ['Loop a band just above the knees and drop into a quarter squat.', 'Step sideways against the band, keeping tension the whole time.', 'Several steps one way, then back the other.'],
    avoid: ['Standing up between steps, which kills the tension.', 'Letting the knees fall inward.'] },
  'band-hamstring': { steps: ['Lie on your back, loop a band around the ball of one foot.', 'Raise that leg with the knee straight and the other leg flat on the floor.', 'Pull gently on the band until you feel a stretch behind the thigh, and breathe.'],
    avoid: ['Bending the raised knee to get the leg higher.', 'Yanking on the band — let it be gentle and steady.'] },
  'bird-dog-warm': { steps: ['On all fours, extend one arm forward and the opposite leg back.', 'Hold two seconds in a straight line.', 'Return and switch sides.'],
    avoid: ['Letting the hips tilt as the leg lifts.'] },
  'bw-squat': { steps: ['Feet shoulder width, toes slightly out.', 'Squat as deep as you comfortably can.', 'Pause a beat at the bottom of the last few reps.'],
    avoid: ['Letting the heels lift or the knees cave inward.'] },
  'hip-9090': { steps: ['Sit with both knees bent at 90°, one leg in front, one out to the side.', 'Drop both knees to the other side without using your hands.', 'Alternate slowly.'],
    avoid: ['Using your hands to force the rotation.'] },
  'ankle-rock': { steps: ['Half-kneeling with the front foot flat.', 'Drive the front knee forward over the toes.', 'Keep the heel glued down, then return.'],
    avoid: ['Letting the heel lift, which removes the ankle stretch.'] },
  'worlds-greatest': { steps: ['Step into a deep lunge.', 'Drop the inside elbow toward the floor beside the front foot.', 'Rotate that arm up to the ceiling, then switch sides.'],
    avoid: ['Letting the back knee sag to the floor.'] },
  'ramp-set-upper': { steps: ['Load roughly half your working weight.', 'Perform 8 controlled reps.', 'Rest a minute, then start your first working set.'],
    avoid: ['Going anywhere near failure. This is preparation, not training.'] },
  'ramp-set-lower': { steps: ['Load roughly half your working weight.', 'Perform 8 controlled reps.', 'Rest a minute, then start your first working set.'],
    avoid: ['Turning it into a real set.'] },
  'ramp-set-full': { steps: ['Load roughly half your working weight.', 'Perform 8 controlled reps.', 'Rest a minute, then start your first working set.'],
    avoid: ['Turning it into a real set.'] },

  'chest-wall': { steps: ['Place the forearm flat against a door frame, elbow at shoulder height.', 'Step through slightly and turn your chest away.', 'Hold where you feel a stretch across the front of the shoulder and chest.'],
    avoid: ['Pushing into sharp pain at the front of the shoulder — ease off until it is a stretch only.'] },
  'cross-body': { steps: ['Bring one arm straight across your chest.', 'Hook it with the opposite forearm and draw it closer.', 'Keep the shoulder pressed down.'],
    avoid: ['Pulling on the elbow joint itself, or letting the shoulder shrug up.'] },
  'tri-overhead': { steps: ['Raise one arm overhead and bend the elbow so the hand drops behind your head.', 'Use the other hand to press gently back on the elbow.', 'Keep the ribs down.'],
    avoid: ['Arching the lower back to gain more range.'] },
  'childs-pose': { steps: ['Kneel and sit your hips back onto your heels.', 'Walk both hands forward and let the chest sink.', 'Walk the hands left, then right, to reach each lat.'],
    avoid: ['Holding your breath — this one is about slow breathing.'] },
  'spinal-twist': { steps: ['Sit tall with one leg crossed over the other.', 'Rotate your torso toward the top knee.', 'Use the arm as a light anchor, not a lever.'],
    avoid: ['Cranking with the arm, or slumping the lower back.'] },
  'neck-side': { steps: ['Let one ear fall toward that shoulder.', 'Let the opposite arm hang heavy to increase the stretch.', 'Breathe and hold — no bouncing.'],
    avoid: ['Pulling the head with your hand. Gravity is enough here.'] },
  'quad-stand': { steps: ['Stand on one leg, holding a wall.', 'Pull the other heel toward your glute.', 'Keep the knees together and push the hip forward.'],
    avoid: ['Letting the knee drift out to the side, or arching the lower back.'] },
  'hamstring-seated': { steps: ['Sit with one leg straight, the other tucked in.', 'Hinge forward from the hip with a flat back.', 'Reach the chest toward the knee.'],
    avoid: ['Rounding the spine to get the hands further — the stretch comes from the hip.'] },
  'figure-4': { steps: ['Lie on your back and cross one ankle over the opposite knee.', 'Thread your hands behind the far thigh.', 'Draw that thigh toward your chest.'],
    avoid: ['Lifting the head and shoulders off the floor to reach.'] },
  'hip-flexor': { steps: ['Half-kneeling, back knee on the mat.', 'Tuck the pelvis under first — this is the important part.', 'Then press the hips forward until you feel the front of the back hip stretch.'],
    avoid: ['Skipping the pelvic tuck and just leaning forward, which stretches nothing.'] },
  'calf-wall': { steps: ['Hands on a wall, one leg back and straight, heel down.', 'Lean in until the calf stretches.', 'Repeat with that knee slightly bent to reach the deeper soleus.'],
    avoid: ['Letting the back heel lift off the floor.'] },
  'butterfly': { steps: ['Sit with the soles of your feet together.', 'Let the knees fall open toward the floor.', 'Sit tall, and hinge gently forward from the hips for more.'],
    avoid: ['Bouncing the knees, or rounding the back instead of hinging.'] },
};

const withDetail = (items) => items.map((i) => ({ ...i, ...(DETAIL[i.id] ?? {}) }));

/** Pick the routine matching a session's emphasis. */
function routineKey(dayName = '') {
  const n = dayName.toLowerCase();
  if (n.includes('upper') || n.includes('push') || n.includes('pull')) return 'upper';
  if (n.includes('lower') || n.includes('leg')) return 'lower';
  return 'full';
}

const WARMUPS = { upper: UPPER_WARMUP, lower: LOWER_WARMUP, full: FULL_WARMUP };
const STRETCHES = { upper: UPPER_STRETCH, lower: LOWER_STRETCH, full: FULL_STRETCH };

export const warmupFor = (dayName) => withDetail(WARMUPS[routineKey(dayName)]);
export const stretchesFor = (dayName) => withDetail(STRETCHES[routineKey(dayName)]);

/** Rough duration of a warm-up or stretch block, in seconds. */
export const blockSeconds = (items) =>
  items.reduce((total, i) => total + (i.seconds ?? i.reps * 3) * (i.perSide ? 2 : 1) + 8, 0);

export const RAMP_PHASES = [RAISE, ACTIVATE, MOBILISE, POTENTIATE];
