// Full-page screenshots of every screen (mobile + desktop, incl. dialogs) for
// visual regression checks. Usage: see specs/007-tailwind-4/plan.md.
import { chromium } from 'playwright';
import fs from 'fs';
const BASE = process.env.BASE, OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const meal = (n) => ({ name: n, ingredients: ['Aveia 40g', 'Banana', 'Leite 200ml'], instructions: 'Misture tudo e sirva.', nutrition: { calories: 420, protein: 22, carbs: 55, fat: 9 } });
const day = { breakfast: meal('Mingau de aveia'), lunch: meal('Frango com arroz'), dinner: meal('Omelete'), snacks: [meal('Iogurte com fruta')] };
const nutrition = { days: { monday: day, tuesday: day, wednesday: day, thursday: day, friday: day, saturday: day, sunday: day }, dietGoal: 'maintenance', mealsPerDay: 4, dailyCalories: 2000, weeklyBudget: 100 };
const workout = {
  monday: [{ name: 'Supino Reto', description: '4 séries de 10 repetições, descanso de 90 segundos.' }, { name: 'Tríceps Testa', description: '3 séries de 12 repetições.' }],
  wednesday: [{ name: 'Agachamento', description: '4 séries de 8 repetições.' }],
  tuesday: 'Dia de descanso', _meta: { v: 1, removed: { monday: 1 } },
};
const viewports = { mobile: { width: 390, height: 844 }, desktop: { width: 1280, height: 900 } };
const browser = await chromium.launch();
for (const [vpName, viewport] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce', serviceWorkers: 'block', locale: 'pt-BR' });
  const page = await ctx.newPage();
  const snap = async (name) => { await page.waitForLoadState('networkidle'); await page.waitForTimeout(600); await page.screenshot({ path: `${OUT}/${vpName}-${name}.png`, fullPage: true }); };
  const seed = async (data) => page.evaluate((d) => { localStorage.clear(); localStorage.setItem('userLanguage', 'pt'); for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); }, data);

  await page.goto(`${BASE}/about`); await seed({}); 
  await page.goto(`${BASE}/home`); await snap('home');
  await page.goto(`${BASE}/about`); await snap('about');
  await page.goto(`${BASE}/generate-workout`); await snap('generate-workout');
  await page.goto(`${BASE}/generate-nutrition`); await snap('generate-nutrition');
  await seed({ generatedWorkout: JSON.stringify(workout), generatedNutrition: Buffer.from(JSON.stringify(nutrition)).toString('base64') });
  await page.goto(`${BASE}/workout`); await snap('workout');
  // delete confirmation dialog
  const row = page.getByTestId('swipe-row').first();
  const box = await row.boundingBox();
  await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width - 160, box.y + box.height / 2, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(400); await snap('workout-swiped');
  await page.getByRole('button', { name: 'Remover exercício' }).first().click();
  await snap('workout-delete-dialog');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.getByRole('button', { name: /Adicionar exercício/ }).click();
  await snap('workout-add-sheet');
  await page.goto(`${BASE}/nutrition`); await snap('nutrition');
  await ctx.close();
}
await browser.close();
console.log('shots:', fs.readdirSync(OUT).length);
