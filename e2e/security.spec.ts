import { test, expect } from '@playwright/test';
import { seed, versionedPlan } from './helpers';

const pages = ['/home', '/about', '/generate-workout', '/generate-nutrition', '/workout'];

test('every page is served with the security headers', async ({ page }) => {
  for (const path of pages) {
    const response = (await page.goto(path))!;
    const h = response.headers();
    expect(h['content-security-policy'], path).toContain("default-src 'self'");
    expect(h['content-security-policy'], path).toContain("frame-ancestors 'none'");
    expect(h['x-content-type-options'], path).toBe('nosniff');
    expect(h['x-frame-options'], path).toBe('DENY');
    expect(h['x-powered-by'], path).toBeUndefined();
  }
});

test.describe('with the service worker running, as in production', () => {
  test.use({ serviceWorkers: 'allow' });

  test('the Content Security Policy blocks nothing and pages throw no errors', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', msg => {
      if (/Content Security Policy|violates the following/i.test(msg.text())) problems.push(msg.text());
    });
    page.on('pageerror', err => problems.push(`pageerror: ${err.message}`));
    await seed(page, { generatedWorkout: JSON.stringify(versionedPlan()) });
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    expect(problems).toEqual([]);
  });
});
