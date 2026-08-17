// Canonical muscle groups used across the app.
// `region` drives which side of the body diagram the muscle appears on.

export const MUSCLES = {
  chest:        { name: 'Chest',            region: 'front', blurb: 'Pectoralis major. Pressing and hugging motions.' },
  'front-delts':{ name: 'Front Delts',      region: 'front', blurb: 'Anterior deltoid. Raises the arm forward and overhead.' },
  'side-delts': { name: 'Side Delts',       region: 'front', blurb: 'Lateral deltoid. Raises the arm out to the side — the shoulder capping muscle.' },
  'rear-delts': { name: 'Rear Delts',       region: 'back',  blurb: 'Posterior deltoid. Pulls the arm backward. Almost always undertrained.' },
  biceps:       { name: 'Biceps',           region: 'front', blurb: 'Biceps brachii. Bends the elbow and supinates the wrist.' },
  triceps:      { name: 'Triceps',          region: 'back',  blurb: 'Triceps brachii. Straightens the elbow. Two thirds of your arm size.' },
  forearms:     { name: 'Forearms',         region: 'front', blurb: 'Wrist flexors and extensors. Drives grip strength.' },
  lats:         { name: 'Lats',             region: 'back',  blurb: 'Latissimus dorsi. Pulls the arm down and back — the width of your back.' },
  'upper-back': { name: 'Upper Back',       region: 'back',  blurb: 'Rhomboids and mid traps. Squeezes the shoulder blades together.' },
  traps:        { name: 'Traps',            region: 'back',  blurb: 'Upper trapezius. Shrugs the shoulders upward.' },
  'lower-back': { name: 'Lower Back',       region: 'back',  blurb: 'Spinal erectors. Extends and braces the spine under load.' },
  abs:          { name: 'Abs',              region: 'front', blurb: 'Rectus abdominis. Flexes the spine and resists extension.' },
  obliques:     { name: 'Obliques',         region: 'front', blurb: 'Internal and external obliques. Rotate and side-bend the torso.' },
  quads:        { name: 'Quads',            region: 'front', blurb: 'Quadriceps. Straightens the knee — the engine of every squat.' },
  hamstrings:   { name: 'Hamstrings',       region: 'back',  blurb: 'Bends the knee and extends the hip. Trained by hinging, not squatting.' },
  glutes:       { name: 'Glutes',           region: 'back',  blurb: 'Gluteus maximus and medius. Extends the hip — your strongest muscle.' },
  calves:       { name: 'Calves',           region: 'back',  blurb: 'Gastrocnemius and soleus. Points the toes. Responds to high reps.' },
  adductors:    { name: 'Inner Thighs',     region: 'front', blurb: 'Adductor group. Pulls the legs together; loaded by wide-stance work.' },
};

export const muscleName = (id) => MUSCLES[id]?.name ?? id;
