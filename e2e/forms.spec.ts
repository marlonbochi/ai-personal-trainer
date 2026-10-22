import { test, expect } from '@playwright/test';
import { isValidWorkoutBody, isValidNutritionBody } from '../src/lib/requestValidation';
import { seed, storedPlan } from './helpers';

// The form -> API contract broke once (field names silently ignored by the
// server). These specs pin the exact body each form sends and check that the
// server-side validator accepts it.

test('generate-workout sends the contract body and opens the stored plan', async ({ page }) => {
  await seed(page, {});
  let sent: any;
  await page.route('**/api/workout', async route => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { monday: [{ name: 'Supino Reto', description: '4x10' }], tuesday: 'Dia de descanso' } });
  });
  await page.goto('/generate-workout');
  await page.locator('select[name="age"]').selectOption('35');
  await page.locator('select[name="duration"]').selectOption('75_min');
  await page.locator('input[name="workoutType"][value="gym"]').check();
  await page.locator('input[name="specificFocusAreas"][value="chest"]').check();
  await page.getByRole('button', { name: 'Gerar', exact: true }).click();

  await expect(page).toHaveURL(/\/workout$/);
  await expect(page.getByRole('heading', { name: 'Supino Reto' })).toBeVisible();
  expect(sent).toEqual({
    language: 'pt',
    fitnessLevel: 'intermediate',
    goal: 'muscle_gain',
    duration: '75_min',
    selectedDays: ['monday', 'wednesday', 'friday'],
    trainerLocation: ['gym'],
    specificFocusAreas: ['chest'],
    injuries: '',
    additionalNotes: '',
    age: '35',
    gender: 'male',
  });
  expect(isValidWorkoutBody(sent)).toBe(true);
  expect((await storedPlan(page))._meta).toEqual({ v: 1 });
});

test('generate-workout shows the server error message to the user', async ({ page }) => {
  await seed(page, {});
  await page.route('**/api/workout', route => route.fulfill({ status: 429, json: { error: 'Too many requests' } }));
  await page.goto('/generate-workout');
  let alertText = '';
  page.once('dialog', dialog => { alertText = dialog.message(); void dialog.dismiss(); });
  await page.getByRole('button', { name: 'Gerar', exact: true }).click();
  await expect.poll(() => alertText).toBe('Too many requests');
  // the form is usable again and nothing was stored
  await expect(page.getByRole('button', { name: 'Gerar', exact: true })).toBeEnabled();
  expect(await storedPlan(page)).toBeNull();
});

test('generate-nutrition sends a body the server accepts and opens the plan', async ({ page }) => {
  await seed(page, {});
  let sent: any;
  const meal = (name: string) => ({ name, ingredients: ['Ovos'], instructions: 'Bata e frite.', nutrition: { calories: 300, protein: 20, carbs: 2, fat: 22 } });
  const day = { breakfast: meal('Omelete de Espinafre'), lunch: meal('Frango Grelhado'), dinner: meal('Sopa de Legumes'), snacks: [meal('Iogurte com Fruta')] };
  await page.route('**/api/nutrition', async route => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { days: { monday: day, tuesday: day, wednesday: day, thursday: day, friday: day, saturday: day, sunday: day } } });
  });
  await page.goto('/generate-nutrition');
  await page.locator('input[name="caloriesPerDay"]').fill('2400');
  await page.getByRole('button', { name: /Gerar/ }).last().click();

  await expect(page).toHaveURL(/\/nutrition$/);
  // dish names the model returns must be shown for every meal, not only for snacks
  for (const dish of ['Omelete de Espinafre', 'Frango Grelhado', 'Sopa de Legumes', 'Iogurte com Fruta'])
    await expect(page.getByText(dish, { exact: true })).toBeVisible();
  expect(sent).toMatchObject({ language: 'pt', dietGoal: 'maintenance', caloriesPerDay: 2400, mealsPerDay: 3, age: 30, gender: 'male' });
  expect(isValidNutritionBody(sent)).toBe(true);
});
