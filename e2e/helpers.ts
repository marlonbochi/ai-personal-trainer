import type { Page } from '@playwright/test';

export type Plan = Record<string, unknown>;

export const versionedPlan = (): Plan => ({
  monday: [
    { name: 'Supino Reto', description: '4 séries de 10' },
    { name: 'Rosca Direta', description: '3 séries de 12' },
    { name: 'Tríceps Testa', description: '3 séries de 12' },
  ],
  wednesday: [{ name: 'Agachamento', description: '4 séries de 8' }],
  tuesday: 'Dia de descanso',
  _meta: { v: 1 },
});

// Stores data before the app reads it. /about never redirects, so it is a safe page to seed from.
export async function seed(page: Page, items: Record<string, string>) {
  await page.goto('/about');
  await page.evaluate(entries => {
    localStorage.clear();
    localStorage.setItem('userLanguage', 'pt');
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
  }, items);
}

export async function storedPlan(page: Page): Promise<any> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('generatedWorkout') ?? 'null'));
}

// Gmail-style swipe: drag the row to the left to reveal its actions.
export async function swipeLeft(page: Page, exerciseName: string) {
  const row = page.getByTestId('swipe-row').filter({ hasText: exerciseName });
  const box = (await row.boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 20, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 170, y, { steps: 8 });
  await page.mouse.up();
}

// Every row renders its (hidden) action buttons; only the swiped row's are the target.
export const rowAction = (page: Page, exerciseName: string, label: string) =>
  page.getByTestId('swipe-row').filter({ hasText: exerciseName }).locator('xpath=..').getByRole('button', { name: label });

export const exerciseNames = (page: Page) => page.getByTestId('swipe-row').locator('h3').allTextContents();
