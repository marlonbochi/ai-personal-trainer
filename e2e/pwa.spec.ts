import { test, expect } from '@playwright/test';
import { seed, versionedPlan } from './helpers';

test.use({ serviceWorkers: 'allow' });

test('the service worker takes control and serves the app offline', async ({ page, context }) => {
  await seed(page, { generatedWorkout: JSON.stringify(versionedPlan()) });
  await page.goto('/workout');
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.active, null, { timeout: 30_000 });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  for (const path of ['/workout', '/generate-workout']) await page.goto(path, { waitUntil: 'networkidle' });

  await context.setOffline(true);

  const visited = await page.goto('/workout');
  expect(visited?.fromServiceWorker()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Supino Reto' })).toBeVisible();

  // never visited while online -> offline fallback page
  await page.goto('/generate-nutrition');
  await expect(page.getByText("You're offline")).toBeVisible();
});
