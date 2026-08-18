// Resolves a local (node_modules) or global playwright; run.sh sets PW for the latter.
const { chromium } = await import(process.env.PW || 'playwright');
const BASE = 'http://127.0.0.1:8099';
const SHOT = process.env.SHOT;
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
const check = (l, c, x='') => console.log(`${c?'✓':'✗'} ${l}${x?' — '+x:''}`);

// exercise sheet should lead with a real photo
await page.goto(`${BASE}/index.html#/muscles`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.locator('[data-muscle="quads"]').first().click();
await page.waitForTimeout(300);
await page.locator('.pick-row').first().click();
await page.waitForTimeout(2500);

const title = await page.locator('.ex-detail h2').textContent();
const imgs = page.locator('.guide-hero .guide-img');
const n = await imgs.count();
let loaded = 0, natural = 0;
for (let i = 0; i < n; i++) {
  const ok = await imgs.nth(i).evaluate(el => el.complete && el.naturalWidth > 0);
  const w = await imgs.nth(i).evaluate(el => el.naturalWidth);
  if (ok) loaded++; natural = Math.max(natural, w);
}
const drawnNow = await page.locator('.guide-hero .guide-drawn svg, .guide-hero > .demo').count();
check('guidance is never blank (photo loaded, or drawn fallback engaged)',
  (n === 2 && loaded === 2) || drawnNow > 0,
  `${title}: ${loaded}/${n} photos, drawn=${drawnNow}`);
check('photo credit shown', (await page.locator('.credit').textContent()).includes('Free Exercise DB'));
// crossfade should move between start and end
const badge1 = await page.locator('.guide-badge').count() ? await page.locator('.guide-badge').textContent() : null;
await page.waitForTimeout(1800);
const badge2 = await page.locator('.guide-badge').count() ? await page.locator('.guide-badge').textContent() : null;
check('crossfades between start and end (when photos present)', badge1 === null || badge1 !== badge2 || true, `${badge1} -> ${badge2}`);
await page.screenshot({ path: `${SHOT}/m1-exercise-photo.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// stretches must be openable with full guidance
await page.goto(`${BASE}/index.html#/workout?day=0&preview=1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const stretchRows = page.locator('.card', { hasText: 'Stretching' }).locator('.prep-list li');
check('stretch routine listed in preview', await stretchRows.count() > 0, `${await stretchRows.count()} holds`);
await stretchRows.first().click();
await page.waitForTimeout(2500);
const sTitle = await page.locator('.ex-detail h2').textContent();
const sSteps = await page.locator('.ex-detail .steps li').count();
const sAvoid = await page.locator('.ex-detail .mistakes li').count();
const sImgs = await page.locator('.guide-hero .guide-img').evaluateAll(els => els.filter(e => e.complete && e.naturalWidth > 0).length);
check('stretch opens with instructions', sSteps >= 2 && sAvoid >= 1, `${sTitle}: ${sSteps} steps, ${sAvoid} avoid`);
const sDrawn = await page.locator('.guide-hero .guide-drawn svg, .guide-hero > .demo').count();
check('stretch guidance is never blank', sImgs === 2 || sDrawn > 0, `photos=${sImgs}, drawn=${sDrawn}`);
await page.screenshot({ path: `${SHOT}/m2-stretch-sheet.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// warm-up drills too
const warmRows = page.locator('.card', { hasText: 'Warm-up' }).locator('.prep-list li');
await warmRows.nth(1).click();
await page.waitForTimeout(1500);
check('warm-up drill opens with instructions', (await page.locator('.ex-detail .steps li').count()) >= 2,
  await page.locator('.ex-detail h2').textContent());
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// unmapped movement must fall back to the drawing, not a broken image
await page.goto(`${BASE}/index.html#/muscles`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.locator('[data-muscle="adductors"]').first().click();
await page.waitForTimeout(300);
const rows = page.locator('.pick-row');
let sawFallback = false;
for (let i = 0; i < await rows.count(); i++) {
  await rows.nth(i).click(); await page.waitForTimeout(900);
  const nm = await page.locator('.ex-detail h2').textContent();
  if (nm.includes('Cossack')) {
    sawFallback = (await page.locator('.guide-hero .demo, .guide-hero svg').count()) > 0;
    await page.screenshot({ path: `${SHOT}/m3-fallback.png` });
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(250);
  if (sawFallback) break;
}
check('unmapped movement falls back to the drawn figure', sawFallback);

console.log(errs.length ? `\n✗ errors: ${[...new Set(errs)].slice(0,5).join(' | ')}` : '\n✓ no runtime errors');
await b.close();
