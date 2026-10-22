import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
import axios from 'axios';
import { resetRateLimits } from '../src/middleware/rateLimit';
import workoutHandler from '../src/pages/api/workout';
import nutritionHandler from '../src/pages/api/nutrition';

const post = axios.post as unknown as ReturnType<typeof vi.fn>;
const reply = (text: string) => ({ data: { candidates: [{ content: { parts: [{ text }] } }] } });

async function promptFor(handler: any, body: Record<string, unknown>): Promise<string> {
  post.mockResolvedValueOnce(reply('{"monday":[]}'));
  const res: any = { statusCode: 0 };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = () => res;
  res.setHeader = () => {};
  await handler({ method: 'POST', headers: { origin: 'https://aitrainer.marlonbochi.com.br' }, socket: {}, body }, res);
  expect(res.statusCode).toBe(200);
  return post.mock.calls[0][1].contents[0].parts[0].text as string;
}

beforeEach(() => {
  resetRateLimits();
  vi.resetAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('GEMINI_API_KEY', 'k');
  vi.stubEnv('GEMINI_API_URL', 'https://example.test/v1beta/models/gemini-2.5-flash:generateContent');
});

describe('workout prompt: training vs rest days', () => {
  it('lists exactly the selected days as workout days and every other day as rest', async () => {
    const p = await promptFor(workoutHandler, { language: 'en', selectedDays: ['monday', 'wednesday', 'friday'] });
    expect(p).toContain('Workout days: monday, wednesday, friday');
    expect(p).toContain('Rest days: tuesday, thursday, saturday, sunday');
  });

  it('forbids rest-day messages on every selected day', async () => {
    const p = await promptFor(workoutHandler, { language: 'en', selectedDays: ['monday', 'tuesday'] });
    expect(p).toContain('MANDATORY RULE: EVERY day listed in "Workout days" (monday, tuesday) MUST receive a real array of exercises');
  });

  it('says there are no rest days when the whole week is selected', async () => {
    const all = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const p = await promptFor(workoutHandler, { language: 'en', selectedDays: all });
    expect(p).toContain('Rest days: None');
  });

  it('maps the English day keys sent by the form to Portuguese for pt', async () => {
    const p = await promptFor(workoutHandler, { language: 'pt', selectedDays: ['monday', 'saturday'] });
    expect(p).toContain('Dias de treino: segunda-feira, sabado');
    expect(p).toContain('Dias de descanso: terca-feira, quarta-feira, quinta-feira, sexta-feira, domingo');
  });

  it('normalises accented Portuguese day names, so a day is never both training and rest', async () => {
    const p = await promptFor(workoutHandler, { language: 'en', selectedDays: ['terça-feira', 'sábado'] });
    expect(p).toContain('Workout days: tuesday, saturday');
    expect(p).toContain('Rest days: monday, wednesday, thursday, friday, sunday');
  });

  it('normalises accented day names on the Portuguese path too', async () => {
    const p = await promptFor(workoutHandler, { language: 'pt', selectedDays: ['terça-feira'] });
    expect(p).toContain('Dias de treino: terca-feira\n');
    expect(p).toContain('Dias de descanso: segunda-feira, quarta-feira, quinta-feira, sexta-feira, sabado, domingo');
  });

  it('falls back to Monday when no day is selected', async () => {
    const p = await promptFor(workoutHandler, { language: 'en', selectedDays: [] });
    expect(p).toContain('Workout days: monday');
    expect(p).toContain('Rest days: tuesday, wednesday, thursday, friday, saturday, sunday');
  });
});

describe('workout prompt: form preferences reach the model', () => {
  it('includes duration, level, goal, location, focus, injuries, notes, age and gender', async () => {
    const p = await promptFor(workoutHandler, {
      language: 'en', duration: '90_min', fitnessLevel: 'advanced', goal: 'muscle_gain',
      trainerLocation: ['gym'], specificFocusAreas: ['legs', 'core'], injuries: 'left knee',
      additionalNotes: 'short rests', age: '41', gender: 'female', selectedDays: ['monday'],
    });
    for (const fragment of [
      'Workout duration: 90 min', 'Fitness level: Advanced.', 'Goal: Muscle Gain.', 'I will train in gym.',
      'Focus areas: legs, core.', 'Injury considerations: left knee.', 'Additional notes: short rests.',
      'This person is 41 years old and female.',
    ]) expect(p).toContain(fragment);
  });

  it('omits the injuries and notes lines when they are empty', async () => {
    const p = await promptFor(workoutHandler, { language: 'en', injuries: '', additionalNotes: '' });
    expect(p).not.toContain('Injury considerations');
    expect(p).not.toContain('Additional notes');
  });
});

describe('nutrition prompt', () => {
  it('uses BRL for Portuguese and USD for English budgets', async () => {
    expect(await promptFor(nutritionHandler, { language: 'pt', budgetPerWeek: 150 })).toContain('Orçamento semanal: 150 BRL.');
    vi.resetAllMocks();
    expect(await promptFor(nutritionHandler, { language: 'en', budgetPerWeek: 150 })).toContain('Weekly budget: 150 USD.');
  });

  it('includes calories, meals per day, restrictions and allergies from the form', async () => {
    const p = await promptFor(nutritionHandler, {
      language: 'en', caloriesPerDay: 2400, mealsPerDay: 5, dietaryRestrictions: ['vegetarian'], allergies: ['peanut'],
    });
    for (const fragment of ['Daily calorie goal: 2400 kcal.', 'for 7 days with 5 meals per day', 'Dietary restrictions: vegetarian.', 'Allergies: peanut.'])
      expect(p).toContain(fragment);
  });

  it('omits restrictions and allergies when none are given', async () => {
    const p = await promptFor(nutritionHandler, { language: 'en', dietaryRestrictions: [], allergies: [] });
    expect(p).not.toContain('Dietary restrictions');
    expect(p).not.toContain('Allergies:');
  });
});
