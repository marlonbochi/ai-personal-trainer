import { test, expect } from '@playwright/test';
import { seed, storedPlan, swipeLeft, exerciseNames, versionedPlan, rowAction } from './helpers';

const addButton = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /Adicionar exercício/ });

test.describe('removing an exercise', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, { generatedWorkout: JSON.stringify(versionedPlan()) });
    await page.goto('/workout');
  });

  test('asks for confirmation, and Cancel keeps the exercise', async ({ page }) => {
    await swipeLeft(page, 'Rosca Direta');
    await rowAction(page, 'Rosca Direta', 'Remover exercício').click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('Rosca Direta');
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).toBeHidden();
    expect(await exerciseNames(page)).toEqual(['Supino Reto', 'Rosca Direta', 'Tríceps Testa']);
  });

  test('confirming removes it, keeps the order and survives a reload', async ({ page }) => {
    await swipeLeft(page, 'Rosca Direta');
    await rowAction(page, 'Rosca Direta', 'Remover exercício').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Remover', exact: true }).click();
    expect(await exerciseNames(page)).toEqual(['Supino Reto', 'Tríceps Testa']);
    await page.reload();
    expect(await exerciseNames(page)).toEqual(['Supino Reto', 'Tríceps Testa']);
    expect((await storedPlan(page))._meta.removed).toEqual({ monday: 1 });
  });
});

test.describe('the "add exercise" button', () => {
  test('is hidden on a freshly generated plan until something is removed that day', async ({ page }) => {
    await seed(page, { generatedWorkout: JSON.stringify(versionedPlan()) });
    await page.goto('/workout');
    await expect(page.getByTestId('swipe-row').first()).toBeVisible();
    await expect(addButton(page)).toHaveCount(0);

    await swipeLeft(page, 'Supino Reto');
    await rowAction(page, 'Supino Reto', 'Remover exercício').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Remover', exact: true }).click();
    await expect(addButton(page)).toBeVisible();

    await page.getByRole('button', { name: 'Qua', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Quarta/ })).toBeVisible();
    await expect(addButton(page)).toHaveCount(0);
  });

  test('is offered on every exercise day of a legacy plan (removals made before tracking are unknown)', async ({ page }) => {
    const { _meta, ...legacy } = versionedPlan();
    await seed(page, { generatedWorkout: JSON.stringify(legacy) });
    await page.goto('/workout');
    await expect(addButton(page)).toBeVisible();
    await page.getByRole('button', { name: 'Qua', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Quarta/ })).toBeVisible();
    await expect(addButton(page)).toBeVisible();
  });
});

test.describe('adding an exercise with AI', () => {
  test.beforeEach(async ({ page }) => {
    const plan = versionedPlan();
    (plan.monday as unknown[]).splice(1, 1);
    plan._meta = { v: 1, removed: { monday: 1 } };
    await seed(page, {
      generatedWorkout: JSON.stringify(plan),
      workoutPreferences: JSON.stringify({ duration: '90_min', fitnessLevel: 'advanced', goal: 'muscle_gain', trainerLocation: ['gym'], injuries: 'left knee', age: 30, gender: 'male' }),
    });
    await page.goto('/workout');
  });

  test('sends the day context, appends the new exercise and hides the button again', async ({ page }) => {
    let sent: any;
    await page.route('**/api/add-exercise', async route => {
      sent = route.request().postDataJSON();
      await route.fulfill({ json: { name: 'Rosca Martelo', description: '3 séries de 12 com halteres' } });
    });
    await addButton(page).click();
    await page.getByLabel(/O que você quer adicionar/).fill('bíceps com halteres');
    await page.getByRole('button', { name: 'Adicionar com IA' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();
    expect(await exerciseNames(page)).toEqual(['Supino Reto', 'Tríceps Testa', 'Rosca Martelo']);
    await expect(addButton(page)).toHaveCount(0);
    expect(sent).toEqual({
      language: 'pt',
      day: 'Segunda-feira',
      otherExercises: ['Supino Reto', 'Tríceps Testa'],
      description: 'bíceps com halteres',
      context: { duration: '90_min', fitnessLevel: 'advanced', goal: 'muscle_gain', trainerLocation: ['gym'], injuries: 'left knee', age: 30, gender: 'male' },
    });
    await page.reload();
    expect(await exerciseNames(page)).toEqual(['Supino Reto', 'Tríceps Testa', 'Rosca Martelo']);
  });

  test('a failure keeps the sheet open with an error and leaves the plan untouched', async ({ page }) => {
    await page.route('**/api/add-exercise', route => route.fulfill({ status: 500, json: { error: 'Failed to add exercise' } }));
    const before = await storedPlan(page);
    await addButton(page).click();
    await page.getByRole('button', { name: 'Adicionar com IA' }).click();
    await expect(page.getByRole('dialog')).toContainText('Não foi possível adicionar');
    expect(await storedPlan(page)).toEqual(before);
  });
});

test('replacing an exercise swaps it in place', async ({ page }) => {
  await seed(page, { generatedWorkout: JSON.stringify(versionedPlan()) });
  await page.goto('/workout');
  let sent: any;
  await page.route('**/api/replace-exercise', async route => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { name: 'Rosca Alternada', description: '3x12' } });
  });
  await swipeLeft(page, 'Rosca Direta');
  await rowAction(page, 'Rosca Direta', 'Editar exercício').click();
  await page.getByLabel(/Por que quer trocar/).fill('sem barra');
  await page.getByRole('button', { name: 'Trocar com IA' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await exerciseNames(page)).toEqual(['Supino Reto', 'Rosca Alternada', 'Tríceps Testa']);
  expect(sent.exercise.name).toBe('Rosca Direta');
  expect(sent.otherExercises).toEqual(['Supino Reto', 'Tríceps Testa']);
  expect(sent.reason).toBe('sem barra');
});
