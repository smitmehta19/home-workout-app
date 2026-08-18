// Animated exercise demonstrations.
//
// Rather than shipping dozens of GIFs (which would be copyrighted, heavy and
// impossible to keep consistent), every demo is a small articulated figure
// posed with joint angles. A pattern is just two poses — the start and end of
// the movement — and the renderer eases between them on a loop.
//
// Angle convention
//   Limb angles are measured from straight DOWN, increasing toward the right.
//     0 = down, 90 = right, 180 = up, -90 = left
//   Torso is measured from straight UP, increasing toward the right.
//     0 = upright, 90 = lying with the head to the right
//   `fore` and `shin` are relative to the segment above them, so 0 is a
//   straight arm or leg.

const TORSO = 42, HEAD = 14, HEAD_R = 9;
const UPPER_ARM = 26, FOREARM = 24;
const THIGH = 30, SHIN = 30;
const GROUND = 178;

const rad = (d) => (d * Math.PI) / 180;
// From straight down, rotating toward +x.
const dirDown = (a) => [Math.sin(rad(a)), Math.cos(rad(a))];
// From straight up, rotating toward +x.
const dirUp = (a) => [Math.sin(rad(a)), -Math.cos(rad(a))];
const step = ([x, y], [dx, dy], len) => [x + dx * len, y + dy * len];

// ── pose presets ────────────────────────────────────────────────────────────
// The figure always faces right, so "forward" is +x and "overhead" is behind the
// head at negative angles. Because angles are interpolated linearly, both poses
// of a movement must sit on the same side of the circle — going from -66 to
// +180 sweeps the arm straight through the floor, so the top of a press is
// written as -180, not 180.
const stand = (o = {}) => ({ hip: [100, 118], torso: 0, arm: 0, fore: 0, thigh: 0, shin: 0, view: 'side', ...o });
const front = (o = {}) => stand({ view: 'front', ...o });
// Lying on the back, head to the right, knees bent with feet on the floor.
const lying = (o = {}) => ({ hip: [84, 164], torso: 90, arm: -66, fore: -114, thigh: -135, shin: 90, view: 'side', ...o });
// Face down, head to the right, supported on the hands (top of a push-up).
const prone = (o = {}) => ({ hip: [92, 138], torso: 78, arm: 0, fore: 0, thigh: -55, shin: 0, view: 'side', ...o });
// Lying flat on the mat, face down.
const flat = (o = {}) => ({ hip: [88, 170], torso: 92, arm: 104, fore: 0, thigh: -92, shin: 0, view: 'side', ...o });
// Hinged at the hip, torso near parallel with the floor, head to the right.
const hinged = (o = {}) => ({ hip: [92, 120], torso: 65, arm: 0, fore: 0, thigh: 10, shin: -20, view: 'side', ...o });
// Seated on the floor with the legs extended to the right.
const seated = (o = {}) => ({ hip: [78, 158], torso: 5, arm: 0, fore: 0, thigh: 95, shin: 0, view: 'side', ...o });
// On all fours, hands and knees on the mat.
const kneel = (o = {}) => ({ hip: [92, 140], torso: 76, arm: 4, fore: 0, thigh: -45, shin: -45, view: 'side', ...o });

// ── movement patterns: [start pose, end pose, seconds per half cycle] ───────
export const PATTERNS = {
  'floor-press':   [lying(), lying({ arm: -180, fore: 0 }), 1.1],
  'floor-flye':    [lying({ arm: -178, fore: -2 }), lying({ arm: -80, fore: -98 }), 1.3],
  'pullover':      [lying({ arm: -178, fore: -2 }), lying({ arm: -252, fore: -8 }), 1.4],
  'skullcrusher':  [lying({ arm: -180, fore: 0 }), lying({ arm: -180, fore: -118 }), 1.0],
  'crunch':        [lying({ arm: -120, fore: -55 }), lying({ torso: 62, arm: -120, fore: -55 }), 1.0],
  'leg-raise':     [lying({ arm: -150, fore: 0, thigh: -94, shin: 0 }),
                    lying({ arm: -150, fore: 0, thigh: -176, shin: 0 }), 1.3],
  'dead-bug':      [lying({ arm: -182, fore: 0, thigh: -128, shin: 84 }),
                    lying({ arm: -238, fore: 0, thigh: -94, shin: 12 }), 1.4],
  'hollow-hold':   [lying({ torso: 74, arm: -212, fore: 0, thigh: -148, shin: 0 }),
                    lying({ torso: 77, arm: -215, fore: 0, thigh: -151, shin: 0 }), 2.4],
  'glute-bridge':  [lying({ hip: [84, 170], torso: 94, arm: -96, fore: -6, thigh: -126, shin: 82 }),
                    lying({ hip: [84, 142], torso: 112, arm: -104, fore: -6, thigh: -106, shin: 70 }), 1.1],
  'ham-curl':      [flat({ thigh: -92, shin: 0 }), flat({ thigh: -92, shin: 104 }), 1.0],
  'superman':      [flat({ hip: [88, 172], torso: 92, arm: 104, thigh: -92 }),
                    flat({ hip: [88, 172], torso: 80, arm: 114, thigh: -76 }), 1.3],

  'pushup':        [prone(),
                    prone({ hip: [92, 152], torso: 82, arm: 30, fore: -84, thigh: -68 }), 1.1],
  'plank':         [prone({ hip: [92, 158], torso: 80, arm: 8, fore: 82, thigh: -72 }),
                    prone({ hip: [92, 161], torso: 80, arm: 8, fore: 82, thigh: -72 }), 2.4],
  'mountain-climber': [prone({ thigh: -58 }), prone({ thigh: 22, shin: 96 }), 0.55],
  'rollout':       [kneel({ hip: [104, 142], torso: 62, arm: 12, fore: 0 }),
                    kneel({ hip: [104, 152], torso: 84, arm: 46, fore: 0 }), 1.5],
  'bird-dog':      [kneel({ arm: 4, thigh: -45, shin: -45 }),
                    kneel({ arm: 88, thigh: -128, shin: 0 }), 1.4],
  'wrist-curl':    [kneel({ hip: [96, 146], torso: 22, arm: 58, fore: 34 }),
                    kneel({ hip: [96, 146], torso: 22, arm: 58, fore: 70 }), 0.8],

  'band-press':    [stand({ arm: 52, fore: -102 }), stand({ arm: 86, fore: 0 }), 1.0],
  'overhead-press':[stand({ arm: 152, fore: 96 }), stand({ arm: 179, fore: 0 }), 1.1],
  'z-press':       [seated({ arm: 152, fore: 96 }), seated({ arm: 179, fore: 0 }), 1.1],
  'seated-calf':   [seated({ torso: 8, thigh: 96, shin: -88, arm: 42, fore: 38 }),
                    seated({ torso: 8, thigh: 96, shin: -76, arm: 42, fore: 38 }), 1.0],
  'twist':         [seated({ hip: [92, 158], torso: -24, thigh: 112, shin: -50, arm: 58, fore: 44 }),
                    seated({ hip: [92, 158], torso: -24, thigh: 112, shin: -50, arm: 98, fore: 44 }), 0.9],

  'bent-row':      [hinged(), hinged({ arm: -26, fore: -100 }), 1.0],
  'single-row':    [hinged({ torso: 72 }), hinged({ torso: 72, arm: -30, fore: -106 }), 1.0],
  'reverse-flye':  [hinged({ arm: -4, fore: 0 }), hinged({ arm: -84, fore: 0 }), 1.1],
  'kickback':      [hinged({ arm: -70, fore: 96 }), hinged({ arm: -70, fore: 2 }), 0.9],

  'pulldown':      [front({ arm: 172, fore: 0 }), front({ arm: 148, fore: 122 }), 1.1],
  'lateral-raise': [front({ arm: 4 }), front({ arm: 88 }), 1.2],
  'pallof':        [front({ arm: 52, fore: -100 }), front({ arm: 80, fore: 0 }), 1.1],
  'side-plank':    [front({ hip: [100, 152], torso: 66, arm: 100, fore: -72, thigh: -84, shin: 0 }),
                    front({ hip: [100, 148], torso: 68, arm: 100, fore: -72, thigh: -84, shin: 0 }), 2.4],

  'front-raise':   [stand({ arm: 4 }), stand({ arm: 92 }), 1.2],
  'upright-row':   [stand({ arm: 4, fore: 8 }), stand({ arm: 46, fore: -104 }), 1.0],
  'curl':          [stand({ arm: 6, fore: 4 }), stand({ arm: 14, fore: 132 }), 1.0],
  'triceps-overhead': [stand({ arm: 179, fore: 0 }), stand({ arm: 179, fore: 124 }), 1.1],
  'pushdown':      [stand({ arm: 8, fore: 96 }), stand({ arm: 6, fore: 2 }), 0.9],
  'shrug':         [stand({ hip: [100, 120] }), stand({ hip: [100, 113] }), 0.8],
  'calf-raise':    [stand({ hip: [100, 120] }), stand({ hip: [100, 106] }), 0.9],
  'carry':         [stand({ thigh: 14, shin: -18 }), stand({ thigh: -14, shin: 10 }), 0.7],

  'squat':         [stand({ torso: 6, thigh: 2, shin: 0 }),
                    stand({ hip: [92, 148], torso: 34, thigh: 62, shin: -96, arm: -6 }), 1.3],
  'front-squat':   [stand({ torso: 4, arm: 128, fore: 84 }),
                    stand({ hip: [94, 148], torso: 22, thigh: 62, shin: -96, arm: 128, fore: 84 }), 1.3],
  'goblet-squat':  [stand({ torso: 4, arm: 150, fore: 62 }),
                    stand({ hip: [94, 148], torso: 22, thigh: 62, shin: -96, arm: 150, fore: 62 }), 1.3],
  'split-squat':   [stand({ hip: [100, 116], thigh: 34, shin: -34 }),
                    stand({ hip: [100, 142], thigh: 52, shin: -88 }), 1.2],
  'wall-sit':      [stand({ hip: [104, 146], thigh: 88, shin: -88, arm: 20 }),
                    stand({ hip: [104, 148], thigh: 88, shin: -88, arm: 20 }), 2.2],
  'deadlift':      [stand({ hip: [96, 132], torso: 52, thigh: 40, shin: -62, arm: -4 }),
                    stand({ hip: [100, 118], torso: 4, thigh: 2, shin: 0, arm: 0 }), 1.4],
  'rdl':           [stand({ torso: 4, thigh: 4, shin: -8 }),
                    stand({ hip: [104, 124], torso: 74, thigh: 14, shin: -22, arm: -6 }), 1.4],
  'single-leg-rdl':[stand({ torso: 4, thigh: 2, shin: 0 }),
                    stand({ hip: [104, 124], torso: 82, thigh: -62, shin: 0, arm: -6 }), 1.5],

  // Arms opening out to the sides, seen head-on. Covers band pull-aparts,
  // external rotation and the shoulder mobility drills.
  'pull-apart':    [front({ arm: 88, fore: 62 }), front({ arm: 88, fore: 2 }), 1.1],
  // Wide stance dropping straight down — plie and sumo squats, lateral lunges,
  // Cossack squats and the adductor stretches.
  'wide-squat':    [front({ hip: [100, 118], thigh: 26, shin: -26 }),
                    front({ hip: [100, 143], thigh: 56, shin: -58 }), 1.3],
  // Hip snap: hinged with the arms hanging back, driving to standing.
  'swing':         [stand({ hip: [100, 126], torso: 58, thigh: 18, shin: -28, arm: -36, fore: 0 }),
                    stand({ torso: 2, thigh: 0, shin: 0, arm: 88, fore: 0 }), 0.85],
  // Squat straight into an overhead press.
  'thruster':      [stand({ hip: [94, 148], torso: 22, thigh: 62, shin: -96, arm: 150, fore: 70 }),
                    stand({ torso: 2, thigh: 2, shin: 0, arm: 179, fore: 0 }), 1.3],
  // Rolling up from flat onto a propped elbow.
  'get-up':        [lying({ arm: -180, fore: 0, thigh: -135, shin: 90 }),
                    lying({ torso: 56, arm: -184, fore: 0, thigh: -122, shin: 82 }), 1.5],
  // Torso tilting sideways, seen head-on.
  'side-bend':     [front({ torso: -2, arm: 3 }), front({ torso: 22, arm: 3 }), 1.1],
};

/** Which prop to draw in the hands, derived from how the exercise is loaded. */
export function propFor(exercise) {
  switch (exercise?.load) {
    case 'barbell': return 'bar';
    case 'dumbbell-pair':
    case 'dumbbell-single': return 'dumbbell';
    case 'band': return 'band';
    default: return 'none';
  }
}

function joints(pose) {
  const hip = pose.hip;
  const shoulder = step(hip, dirUp(pose.torso), TORSO);
  const head = step(shoulder, dirUp(pose.torso), HEAD);
  const elbow = step(shoulder, dirDown(pose.arm), UPPER_ARM);
  const hand = step(elbow, dirDown(pose.arm + pose.fore), FOREARM);
  const knee = step(hip, dirDown(pose.thigh), THIGH);
  const ankle = step(knee, dirDown(pose.thigh + pose.shin), SHIN);
  return { hip, shoulder, head, elbow, hand, knee, ankle };
}

function mirrorJoints(pose) {
  const m = { ...pose, arm: -pose.arm, fore: -pose.fore, thigh: -pose.thigh, shin: -pose.shin };
  const j = joints(m);
  return j;
}

const lerp = (a, b, t) => a + (b - a) * t;

function lerpPose(a, b, t) {
  return {
    hip: [lerp(a.hip[0], b.hip[0], t), lerp(a.hip[1], b.hip[1], t)],
    torso: lerp(a.torso, b.torso, t),
    arm: lerp(a.arm, b.arm, t),
    fore: lerp(a.fore, b.fore, t),
    thigh: lerp(a.thigh, b.thigh, t),
    shin: lerp(a.shin, b.shin, t),
    view: a.view,
  };
}

// Bands run from the hands back to an anchor. Keeping it relative to the hand
// means it stays inside the auto-fitted viewBox whatever the pose.
const bandAnchor = ([hx, hy]) => [hx + 62, hy - 46];

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs) => {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};
const line = (a, b, cls) => el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls });

function drawProp(group, hand, prop, view) {
  if (prop === 'dumbbell') {
    group.appendChild(el('rect', { x: hand[0] - 9, y: hand[1] - 4.5, width: 18, height: 9, rx: 2.5, class: 'fig-prop' }));
  } else if (prop === 'bar') {
    if (view === 'front') {
      group.appendChild(el('line', { x1: hand[0] - 46, y1: hand[1], x2: hand[0] + 46, y2: hand[1], class: 'fig-prop-stroke' }));
      group.appendChild(el('circle', { cx: hand[0] - 42, cy: hand[1], r: 8, class: 'fig-prop' }));
      group.appendChild(el('circle', { cx: hand[0] + 42, cy: hand[1], r: 8, class: 'fig-prop' }));
    } else {
      // Seen end-on from the side, a loaded bar reads as a plate.
      group.appendChild(el('circle', { cx: hand[0], cy: hand[1], r: 10, class: 'fig-prop' }));
    }
  } else if (prop === 'band') {
    const [ax, ay] = bandAnchor(hand);
    group.appendChild(el('line', { x1: hand[0], y1: hand[1], x2: ax, y2: ay, class: 'fig-band' }));
    group.appendChild(el('circle', { cx: ax, cy: ay, r: 3.5, class: 'fig-prop' }));
  }
}

/** Draw one frame of the figure into an existing <g>. */
function drawPose(group, pose, prop) {
  group.replaceChildren();
  const j = joints(pose);

  if (pose.view === 'front') {
    const m = mirrorJoints(pose);
    group.appendChild(line(j.hip, m.knee, 'fig-limb fig-far'));
    group.appendChild(line(m.knee, m.ankle, 'fig-limb fig-far'));
    group.appendChild(line(j.shoulder, m.elbow, 'fig-limb fig-far'));
    group.appendChild(line(m.elbow, m.hand, 'fig-limb fig-far'));
  }

  group.appendChild(line(j.hip, j.knee, 'fig-limb'));
  group.appendChild(line(j.knee, j.ankle, 'fig-limb'));
  group.appendChild(line(j.hip, j.shoulder, 'fig-torso'));
  group.appendChild(line(j.shoulder, j.elbow, 'fig-limb'));
  group.appendChild(line(j.elbow, j.hand, 'fig-limb'));
  group.appendChild(el('circle', { cx: j.head[0], cy: j.head[1], r: HEAD_R, class: 'fig-head' }));

  if (prop !== 'none') {
    drawProp(group, j.hand, prop, pose.view);
    if (pose.view === 'front' && prop === 'dumbbell') {
      const m = mirrorJoints(pose);
      drawProp(group, m.hand, prop, pose.view);
    }
  }
}

/** Extent of a pose, including the head and anything held in the hands. */
function extent(pose, prop) {
  const j = joints(pose);
  const points = [j.hip, j.shoulder, j.elbow, j.hand, j.knee, j.ankle];
  if (pose.view === 'front') {
    const m = mirrorJoints(pose);
    points.push(m.elbow, m.hand, m.knee, m.ankle);
  }
  const box = {
    minX: Math.min(...points.map((p) => p[0])), maxX: Math.max(...points.map((p) => p[0])),
    minY: Math.min(...points.map((p) => p[1])), maxY: Math.max(...points.map((p) => p[1])),
  };
  if (prop === 'band') points.push(bandAnchor(j.hand));
  // The head sits outside the joint list, and props stick out past the hands.
  const pad = prop === 'bar' && pose.view === 'front' ? 50 : prop === 'none' ? 0 : 11;
  box.minX = Math.min(box.minX, ...points.map((p) => p[0]));
  box.maxX = Math.max(box.maxX, ...points.map((p) => p[0]));
  box.minY = Math.min(box.minY, ...points.map((p) => p[1]));
  box.maxY = Math.max(box.maxY, ...points.map((p) => p[1]));
  return {
    minX: Math.min(box.minX, j.head[0] - HEAD_R) - pad,
    maxX: Math.max(box.maxX, j.head[0] + HEAD_R) + pad,
    minY: Math.min(box.minY, j.head[1] - HEAD_R) - pad,
    maxY: Math.max(box.maxY, j.head[1] + HEAD_R) + pad,
  };
}

/**
 * Build a looping demo. Returns the <svg> element; call `.stop()` on it when
 * removing it from the DOM so the animation frame loop is released.
 *
 * The viewBox is fitted to the union of both poses so each movement fills its
 * frame — a floor press and a standing press are very different shapes, and a
 * single fixed box leaves one of them tiny.
 */
export function createDemo(patternId, prop = 'none', { paused = false } = {}) {
  const [poseA, poseB, period] = PATTERNS[patternId] ?? PATTERNS['carry'];

  const a = extent(poseA, prop);
  const b = extent(poseB, prop);
  const touchesGround = Math.max(a.maxY, b.maxY) > GROUND - 22;
  const box = {
    minX: Math.min(a.minX, b.minX) - 10,
    maxX: Math.max(a.maxX, b.maxX) + 10,
    minY: Math.min(a.minY, b.minY) - 10,
    maxY: (touchesGround ? GROUND + 6 : Math.max(a.maxY, b.maxY)) + 10,
  };
  // Keep a floor of squareness so short-and-wide poses aren't blown up huge.
  const w = Math.max(box.maxX - box.minX, 110);
  const hgt = Math.max(box.maxY - box.minY, 110);

  const svg = el('svg', {
    viewBox: `${box.minX} ${box.minY} ${w} ${hgt}`,
    class: 'demo', role: 'img', 'aria-label': 'Animated exercise demonstration',
  });

  if (touchesGround) {
    svg.appendChild(el('line', {
      x1: box.minX + 4, y1: GROUND + 3, x2: box.minX + w - 4, y2: GROUND + 3, class: 'fig-ground',
    }));
  }
  const group = el('g', {});
  svg.appendChild(group);

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let raf = null;
  let start = null;

  if (paused || reduced) {
    drawPose(group, lerpPose(poseA, poseB, reduced ? 0.5 : 0), prop);
  } else {
    const tick = (now) => {
      start ??= now;
      const cycle = period * 2000;
      const phase = ((now - start) % cycle) / cycle;      // 0 → 1 across a full there-and-back
      const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
      const eased = tri < 0.5 ? 2 * tri * tri : 1 - (-2 * tri + 2) ** 2 / 2;
      drawPose(group, lerpPose(poseA, poseB, eased), prop);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  svg.stop = () => raf && cancelAnimationFrame(raf);
  return svg;
}
