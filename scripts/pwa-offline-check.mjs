// Real-browser offline check for the service worker (manual / pre-merge).
// Phase "online" visits pages while the server runs; phase "offline" reloads
// them after the server is stopped. See specs/006-replace-next-pwa/plan.md.
import { chromium } from 'playwright';
const BASE = process.env.BASE;
const phase = process.argv[2];
const ctx = await chromium.launchPersistentContext('/work/profile', {
  args: [`--unsafely-treat-insecure-origin-as-secure=${BASE}`],
  serviceWorkers: 'allow',
});
const page = ctx.pages()[0] ?? await ctx.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
const text = async () => (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 90);

if (phase === 'online') {
  await page.goto(`${BASE}/home`);
  await page.evaluate(() => {
    localStorage.setItem('generatedWorkout', JSON.stringify({ monday: [{ name: 'Supino Reto', description: '4x10' }], _meta: { v: 1 } }));
    localStorage.setItem('userLanguage', 'pt');
  });
  await page.goto(`${BASE}/workout`);
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.active, null, { timeout: 30000 });
  await page.reload({ waitUntil: 'networkidle' });
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  for (const p of ['/workout', '/generate-workout', '/home']) await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
  const caches = await page.evaluate(async () => {
    const out = {};
    for (const k of await self.caches.keys()) out[k] = (await (await self.caches.open(k)).keys()).length;
    return out;
  });
  console.log(JSON.stringify({ phase, controlled, caches, errors }, null, 1));
} else {
  const results = {};
  for (const p of ['/workout', '/generate-workout', '/about']) {
    try {
      const r = await page.goto(`${BASE}${p}`, { waitUntil: 'load', timeout: 20000 });
      results[p] = { status: r?.status(), fromSW: r?.fromServiceWorker(), text: await text() };
    } catch (e) {
      results[p] = { error: e.message.split('\n')[0] };
    }
  }
  console.log(JSON.stringify({ phase, results, errors }, null, 1));
}
await ctx.close();
