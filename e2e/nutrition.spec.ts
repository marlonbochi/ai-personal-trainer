import { test, expect, type Page } from '@playwright/test';
import { seed } from './helpers';

const meal = (name: string) => ({
  name,
  ingredients: ['2 ovos'],
  instructions: 'Bata e frite.',
  nutrition: { calories: 300, protein: 20, carbs: 2, fat: 22 },
});

// Shaped like a real pt plan: Portuguese day keys, English meal keys copied from the prompt's example.
const ptPlan = {
  days: {
    'Segunda-feira': {
      Breakfast: meal('Omelete de Espinafre'),
      Lunch: meal('Frango Grelhado'),
      'Brunch especial': meal('Panqueca'),
      Snacks: [meal('Iogurte com Fruta')],
    },
    'Terça-feira': { Dinner: meal('Sopa de Legumes') },
  },
};

// The app stores the plan as base64 of the JSON (Latin-1, like the page's btoa).
const stored = (plan: unknown) => Buffer.from(JSON.stringify(plan), 'latin1').toString('base64');

async function open(page: Page, language: 'pt' | 'en') {
  await seed(page, { generatedNutrition: stored(ptPlan), userLanguage: language });
  await page.goto('/nutrition');
}

test('pt: macros, meals and days are in Portuguese', async ({ page }) => {
  await open(page, 'pt');

  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Segunda-feira');
  await expect(page.getByRole('button', { name: 'Seg', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ter', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Café da manhã', 'Almoço', 'Brunch especial', 'Lanches']);

  const macros = page.getByTestId('macros').first();
  await expect(macros).toContainText('P: 20g');
  await expect(macros).toContainText('C: 2g');
  await expect(macros).toContainText('G: 22g');
  await expect(macros).not.toContainText('F:');
  await expect(macros.locator('abbr[title="Gorduras"]')).toHaveText('G');
  await expect(macros.locator('abbr[title="Carboidratos"]')).toHaveText('C');
  await expect(macros.locator('abbr[title="Proteína"]')).toHaveText('P');

  await page.getByRole('button', { name: 'Ter', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Terça-feira');
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Jantar']);
});

test('en: the same pt-generated plan is labelled in English', async ({ page }) => {
  await open(page, 'en');

  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Monday');
  await expect(page.getByRole('button', { name: 'Mon', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tue', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Breakfast', 'Lunch', 'Brunch especial', 'Snacks']);

  const macros = page.getByTestId('macros').first();
  await expect(macros).toContainText('F: 22g');
  await expect(macros.locator('abbr[title="Fat"]')).toHaveText('F');
  // dish text is model output and stays as generated
  await expect(page.getByText('Omelete de Espinafre', { exact: true })).toBeVisible();
});

test('a generated plan with characters outside Latin-1 is saved and shown', async ({ page }) => {
  await seed(page, {});
  // Gemini regularly writes en dashes and similar; btoa() threw on them and the plan was lost.
  const day = { Breakfast: meal('Omelete – versão leve'), Snacks: [meal('Mix de castanhas 🥜')] };
  await page.route('**/api/nutrition', route => route.fulfill({ json: { days: { 'Segunda-feira': day } } }));
  await page.goto('/generate-nutrition');
  await page.getByRole('button', { name: /Gerar/ }).last().click();

  await expect(page).toHaveURL(/\/nutrition$/);
  await expect(page.getByText('Omelete – versão leve', { exact: true })).toBeVisible();
  await expect(page.getByText('Mix de castanhas 🥜', { exact: true })).toBeVisible();

  // and it is still there after a reload
  await page.reload();
  await expect(page.getByText('Omelete – versão leve', { exact: true })).toBeVisible();
});

for (const [label, stored] of [['not JSON', 'not a plan'], ['JSON without days', '{"other":1}']])
  test(`a corrupt stored plan (${label}) shows the empty state instead of crashing`, async ({ page }) => {
    await seed(page, { generatedNutrition: stored });
    await page.goto('/nutrition');
    await expect(page.getByRole('button', { name: 'Criar Plano Nutricional' })).toBeVisible();
  });
