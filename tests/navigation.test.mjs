// Resolves a local (node_modules) or global playwright; run.sh sets PW for the latter.
const { chromium } = await import(process.env.PW || 'playwright');
const BASE='http://127.0.0.1:8099';
const b = await chromium.launch();
const page = await b.newPage({ viewport:{width:402,height:874} });
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
const check=(l,c,x='')=>console.log(`${c?'✓':'✗'} ${l}${x?' — '+x:''}`);
const open = async () => (await page.locator('.sheet-backdrop').count()) > 0;
let fails = 0;

// Every place a sheet can be opened from, with the phone's back gesture.
const cases = [
  ['home screen exercise',   '#/',                       '.ex-row'],
  ['home screen warm-up',    '#/',                       '.bookend .drill-chip'],
  ['session preview',        '#/workout?day=0&preview=1','.ex-row'],
  ['preview stretch',        '#/workout?day=0&preview=1','.card:has-text("Stretching") .prep-list li'],
  ['muscle map',             '#/muscles',                null],
];

for (const [label, hash, sel] of cases) {
  await page.goto(`${BASE}/index.html${hash}`, {waitUntil:'networkidle'});
  await page.waitForTimeout(500);
  if (hash === '#/muscles') {
    await page.locator('[data-muscle="chest"]').first().click();
    await page.waitForTimeout(400);
  }
  const target = page.locator(sel ?? '.pick-row').first();
  if (!(await target.count())) { check(`${label}: found something to open`, false); fails++; continue; }
  const hashBefore = await page.evaluate(()=>location.hash);
  await target.click();
  await page.waitForTimeout(600);
  const opened = await open();
  await page.goBack();
  await page.waitForTimeout(700);
  const closed = !(await open());
  const stayed = (await page.evaluate(()=>location.hash)) === hashBefore;
  const ok = opened && closed && stayed;
  if (!ok) fails++;
  check(`back closes the sheet from the ${label}`, ok,
    `opened=${opened} closed=${closed} stayedOnPage=${stayed}`);
}

// mid-workout: the info button, which is where you are most likely to need it
await page.goto(`${BASE}/index.html#/workout?day=0`, {waitUntil:'networkidle'});
await page.waitForTimeout(600);
await page.locator('.player-head .icon-btn').nth(1).click();
await page.waitForTimeout(700);
const o1 = await open();
await page.goBack(); await page.waitForTimeout(700);
const c1 = !(await open());
const stillInWorkout = (await page.evaluate(()=>location.hash)).includes('workout');
check('back closes the sheet mid-workout without leaving the workout', o1 && c1 && stillInWorkout,
  `opened=${o1} closed=${c1} stillInWorkout=${stillInWorkout}`);
if (!(o1 && c1 && stillInWorkout)) fails++;

// two sheets deep should need two backs, not one
await page.goto(`${BASE}/index.html#/settings`, {waitUntil:'networkidle'});
await page.waitForTimeout(400);
await page.locator('.btn-danger').click();
await page.waitForTimeout(600);
await page.goBack(); await page.waitForTimeout(700);
check('back dismisses a confirm and stays on settings',
  !(await open()) && (await page.evaluate(()=>location.hash)).includes('settings'));

console.log(errs.length ? `\n✗ page errors: ${[...new Set(errs)].slice(0,3).join(' | ')}` : '\n✓ no page errors');
console.log(fails ? `\n${fails} FAILURES` : '\nall navigation paths pass');
await b.close();
