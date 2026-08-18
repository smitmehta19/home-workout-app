// Does a shipped change actually reach someone who already has the app?
//
// This is the test that would have caught the cache-first service worker that
// pinned returning users to whatever build they first installed. It has to
// install the worker FIRST, then change a file, then relaunch — a clean
// browser context has no worker and so never exercises the upgrade path.
//
// Note: page.goto() to a URL that is already loaded does not re-navigate, so
// this uses reload() and a genuinely new page instead.

const { chromium } = await import(process.env.PW || 'playwright');
import fs from 'fs';

const DIR = process.env.DIR;
const BASE = `http://127.0.0.1:${process.env.UPDATE_PORT || 8123}`;
const check = (l, c, x = '') => { console.log(`${c ? '✓' : '✗'} ${l}${x ? ' — ' + x : ''}`); if (!c) failures++; };
let failures = 0;

const setVersion = (v) => fs.writeFileSync(`${DIR}/js/version.js`, `export const APP_VERSION = '${v}';\n`);
const shown = async (page) => (await page.locator('.version').textContent()).trim();

setVersion('TEST-BASE');

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 } });
let page = await ctx.newPage();

// 1. Install and take control — the "already has the app" state.
await page.goto(`${BASE}/index.html#/settings`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 20000 })
  .catch(() => {});
check('service worker takes control', await page.evaluate(() => navigator.serviceWorker.controller !== null));
check('the running build is identifiable', (await shown(page)).includes('TEST-BASE'), await shown(page));

// 2. Ship a change and reload the open app.
setVersion('TEST-RELOAD');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
check('reloading the open app runs the new build', (await shown(page)).includes('TEST-RELOAD'), await shown(page));

// 3. Ship again and relaunch the app, as from a home screen icon.
setVersion('TEST-RELAUNCH');
await page.close();
page = await ctx.newPage();
await page.goto(`${BASE}/index.html#/settings`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
check('relaunching the app runs the new build', (await shown(page)).includes('TEST-RELAUNCH'), await shown(page));

// 4. None of that may cost offline support.
await ctx.setOffline(true);
await page.close();
page = await ctx.newPage();
await page.goto(`${BASE}/index.html#/`, { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.waitForTimeout(4000);
const offline = await page.locator('.page-head h1').count() > 0;
check('still loads with no network at all', offline, offline ? await page.locator('.page-head h1').textContent() : 'blank');
await ctx.setOffline(false);

await browser.close();
console.log(failures ? `\n${failures} FAILURES` : '\nupdates reach installed users');
process.exit(failures ? 1 : 0);
