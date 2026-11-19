import { test, expect } from '@playwright/test';
import { seed } from './helpers';

const NAME = 'AI FitCoach';
const OLD_NAMES = /AI Personal Trainer|AI Trainer/;
const pages = ['/home', '/about', '/generate-workout', '/generate-nutrition'];

for (const language of ['pt', 'en'] as const) {
  test(`${language}: every page shows ${NAME} and never the old name`, async ({ page }) => {
    await seed(page, { userLanguage: language });
    for (const path of pages) {
      await page.goto(path);
      await expect(page, path).toHaveTitle(NAME);
      await expect(page.locator('meta[name="application-name"]'), path).toHaveAttribute('content', NAME);
      // exactly one: a second, hand-written tag used to contradict the metadata one
      await expect(page.locator('meta[name="apple-mobile-web-app-title"]'), path).toHaveCount(1);
      await expect(page.locator('meta[name="apple-mobile-web-app-title"]'), path).toHaveAttribute('content', NAME);
      await expect(page.locator('meta[property="og:title"]'), path).toHaveAttribute('content', NAME);
      await expect(page.locator('body'), path).not.toContainText(OLD_NAMES);
    }
  });
}

test('the home screen greets with the app name', async ({ page }) => {
  await seed(page, {});
  await page.goto('/home');
  await expect(page.getByText(NAME, { exact: true })).toBeVisible();
});

test('the About page is titled with the app name in both languages', async ({ page }) => {
  await seed(page, {});
  await page.goto('/about');
  await expect(page.getByText(`Sobre o ${NAME}`).first()).toBeVisible();

  await page.evaluate(() => localStorage.setItem('userLanguage', 'en'));
  await page.reload();
  await expect(page.getByText(`About ${NAME}`).first()).toBeVisible();
});

test('the PWA manifest installs as AI FitCoach', async ({ request }) => {
  const manifest = await (await request.get('/manifest.json')).json();
  expect(manifest.name).toBe(NAME);
  expect(manifest.short_name).toBe(NAME);
  expect(JSON.stringify(manifest)).not.toMatch(OLD_NAMES);
});

test('the offline page carries the app name', async ({ request }) => {
  const html = await (await request.get('/offline.html')).text();
  expect(html).toContain(`<title>Offline - ${NAME}</title>`);
  expect(html).not.toMatch(OLD_NAMES);
});
