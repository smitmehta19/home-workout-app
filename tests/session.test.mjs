// Resolves a local (node_modules) or global playwright; run.sh sets PW for the latter.
const { chromium } = await import(process.env.PW || 'playwright');

const BASE = process.env.BASE ?? 'http://127.0.0.1:8099';
const SHOT = process.env.SHOT ?? '/tmp/shots';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
// Photo hosts may be unreachable (offline, firewall, CI); the app is designed
// to fall back to drawings, so those are not app failures.
const PHOTO_HOSTS = /jsdelivr|githubusercontent/;
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const text = m.text();
  if (PHOTO_HOSTS.test(text) || (text.includes('Failed to load resource') && text.includes('net::ERR'))) return;
  errors.push(`console: ${text}`);
});
page.on('requestfailed', (r) => { if (!PHOTO_HOSTS.test(r.url())) errors.push(`request failed: ${r.url()}`); });

const check = (label, cond, extra = '') =>
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? ' — ' + extra : ''}`);

// ── 1. Home ─────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/index.html#/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const h1 = await page.locator('.page-head h1').first().textContent();
check('home renders a session title', Boolean(h1), h1);

// Force a training day so the test is deterministic regardless of what day it is.
await page.goto(`${BASE}/index.html#/workout?day=0&preview=1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const previewCount = await page.locator('.ex-row').count();
check('preview lists exercises', previewCount >= 6, `${previewCount} exercises`);
await page.screenshot({ path: `${SHOT}/1-preview.png` });

// ── 2. Demo animation actually moves ────────────────────────────────────────
await page.locator('.ex-row').first().click();
await page.waitForTimeout(500);
const sheetTitle = await page.locator('.ex-detail h2').textContent();
const frame1 = await page.locator('.guide-hero').innerHTML();
await page.waitForTimeout(450);
const frame2 = await page.locator('.guide-hero').innerHTML();
check('exercise sheet opens', Boolean(sheetTitle), sheetTitle);
check('demo guidance is animating', frame1 !== frame2);
check('sheet has cues and mistakes',
  (await page.locator('.cues li').count()) > 0 && (await page.locator('.mistakes li').count()) > 0);
await page.screenshot({ path: `${SHOT}/2-exercise-sheet.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// ── 3. Run a whole workout ──────────────────────────────────────────────────
await page.goto(`${BASE}/index.html#/workout?day=0`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
check('player opens on the warm-up', (await page.locator('.prep').count()) > 0);
await page.screenshot({ path: `${SHOT}/3-player.png` });

// Walk through the warm-up so the working screen is reachable.
const openedOnWarmup = (await page.locator('.prep .eyebrow').textContent()).toLowerCase().includes('warm-up');
let warmupDrills = 0;
await page.screenshot({ path: `${SHOT}/w1-warmup.png` });
for (let i = 0; i < 40 && await page.locator('.prep').count(); i++) {
  warmupDrills++;
  await page.locator('.prep .btn-start').click();
  await page.waitForTimeout(70);
}
check('reached the working sets after the warm-up', (await page.locator('.player-body').count()) > 0);
check('session opens on the warm-up, before any lifting', openedOnWarmup, `${warmupDrills} warm-up screens`);
const coachEarly = await page.locator('.note-coach').count();

// Weight stepper
const before = await page.locator('.stepper-value').first().textContent();
await page.locator('.step-btn').nth(1).click();
await page.waitForTimeout(150);
const after = await page.locator('.stepper-value').first().textContent();
check('weight stepper increments', before !== after, `${before} → ${after}`);

let sets = 0;
let sawRest = false, sawWarmup = openedOnWarmup, sawStretch = false, warmupFirst = openedOnWarmup;
let stretchAfterWork = false, workStarted = false;
for (let i = 0; i < 400; i++) {
  if (await page.locator('.summary').count()) break;

  if (await page.locator('.prep').count()) {
    const eyebrow = await page.locator('.prep .eyebrow').textContent();
    if (eyebrow.toLowerCase().includes('warm-up')) {
      if (!sawWarmup) { sawWarmup = true; warmupFirst = !workStarted; await page.screenshot({ path: `${SHOT}/w1-warmup.png` }); }
    } else {
      if (!sawStretch) { sawStretch = true; stretchAfterWork = workStarted; await page.screenshot({ path: `${SHOT}/w3-stretch.png` }); }
    }
    await page.locator('.prep .btn-start').click();
    await page.waitForTimeout(70);
    continue;
  }

  if (await page.locator('.rest').count()) {
    if (!sawRest) { sawRest = true; await page.screenshot({ path: `${SHOT}/4-rest.png` }); }
    const skip = page.locator('.rest-actions .btn-primary');
    if (await skip.count()) { await skip.click(); }
    else { await page.locator('.rest .btn-ghost').first().click(); }
    await page.waitForTimeout(70);
    continue;
  }

  const start = page.locator('.player-body .btn-start');
  if (await start.count()) {
    if (!workStarted) { workStarted = true; await page.screenshot({ path: `${SHOT}/w2-work.png` }); }
    await start.click();
    sets++;
    await page.waitForTimeout(70);
    continue;
  }
  break;
}

check('warm-up phase ran, and ran first', sawWarmup && warmupFirst === true);
check('stretch phase ran, and ran after the lifting', sawStretch && stretchAfterWork);
check('rest screen appeared', sawRest);
check('worked through all sets', sets >= 20, `${sets} sets completed`);
check('reached summary screen', (await page.locator('.summary').count()) > 0);
await page.screenshot({ path: `${SHOT}/5-summary.png` });

await page.locator('.summary .btn-primary').click();
await page.waitForTimeout(600);

// ── 4. History ──────────────────────────────────────────────────────────────
check('landed on history', page.url().includes('history'), page.url());
const logged = await page.locator('.session-card').count();
check('session was saved', logged >= 1, `${logged} session(s)`);
await page.screenshot({ path: `${SHOT}/6-history.png`, fullPage: true });

// ── 5. Muscle map ───────────────────────────────────────────────────────────
await page.goto(`${BASE}/index.html#/muscles`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const regions = await page.locator('.bm-region').count();
check('body map renders regions', regions > 10, `${regions} tappable regions`);

await page.locator('[data-muscle="chest"]').first().click();
await page.waitForTimeout(300);
const picks = await page.locator('.pick-row').count();
const muscleTitle = await page.locator('.muscle-head h2').textContent();
check('tapping a muscle lists exercises', picks > 3, `${muscleTitle}: ${picks} exercises`);
await page.screenshot({ path: `${SHOT}/7-muscles-front.png`, fullPage: true });

await page.locator('.seg-btn', { hasText: 'Back' }).click();
await page.waitForTimeout(300);
const backRegions = await page.locator('.bm-region').count();
check('back view renders', backRegions > 10, `${backRegions} regions`);
await page.locator('[data-muscle="lats"]').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${SHOT}/8-muscles-back.png`, fullPage: true });

// ── 6. Settings + progression carry-over ────────────────────────────────────
await page.goto(`${BASE}/index.html#/settings`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
check('settings renders', (await page.locator('.field').count()) >= 5);
await page.screenshot({ path: `${SHOT}/9-settings.png`, fullPage: true });

// Home should now show progression notes derived from the logged session.
await page.goto(`${BASE}/index.html#/workout?day=0&preview=1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.goto(`${BASE}/index.html#/workout?day=0`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
for (let i = 0; i < 40 && await page.locator('.prep').count(); i++) {
  await page.locator('.prep .btn-start').click();
  await page.waitForTimeout(70);
}
const coachNote = await page.locator('.note-coach').count();
check('progression note appears after history exists', coachNote > 0,
  coachNote ? (await page.locator('.note-coach').first().textContent()).slice(0, 90) : 'none');

await page.goto(`${BASE}/index.html#/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.screenshot({ path: `${SHOT}/0-home.png`, fullPage: true });

console.log(errors.length ? `\n✗ ${errors.length} runtime errors:` : '\n✓ no runtime errors');
for (const e of [...new Set(errors)].slice(0, 12)) console.log('   ', e);

await browser.close();
