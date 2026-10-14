// Server-side validation for the plan-generation routes. Mirrors what the
// forms can legitimately send (numbers may arrive as numeric strings).

const WORKOUT_DURATIONS = ['15_min', '30_min', '45_min', '60_min', '75_min', '90_min', '120_min'];
const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const WORKOUT_GOALS = ['weight_loss', 'muscle_gain', 'endurance', 'strength'];
const DIET_GOALS = ['weight_loss', 'muscle_gain', 'maintenance', 'endurance'];
const GENDERS = ['male', 'female'];
const LANGUAGES = ['en', 'pt'];
const WEEKDAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'segunda-feira', 'terca-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado', 'sábado', 'domingo',
];

const MAX_TEXT = 500;
const MAX_ITEM = 50;

const optional = (value: unknown, check: (v: unknown) => boolean) => value === undefined || check(value);
const oneOf = (allowed: string[]) => (v: unknown) => typeof v === 'string' && allowed.includes(v);
const text = (v: unknown) => typeof v === 'string' && v.length <= MAX_TEXT;
const list = (maxItems: number, allowed?: string[]) => (v: unknown) =>
  Array.isArray(v) &&
  v.length <= maxItems &&
  v.every(item => typeof item === 'string' && item.length > 0 && item.length <= MAX_ITEM &&
    (!allowed || allowed.includes(item.toLowerCase())));
const numberIn = (min: number, max: number) => (v: unknown) => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
};

function isObject(body: unknown): body is Record<string, unknown> {
  return !!body && typeof body === 'object' && !Array.isArray(body);
}

export function isValidWorkoutBody(body: unknown): boolean {
  if (!isObject(body)) return false;
  return (
    optional(body.language, oneOf(LANGUAGES)) &&
    optional(body.fitnessLevel, oneOf(FITNESS_LEVELS)) &&
    optional(body.goal, oneOf(WORKOUT_GOALS)) &&
    optional(body.duration, oneOf(WORKOUT_DURATIONS)) &&
    optional(body.daysPerWeek, numberIn(1, 7)) &&
    optional(body.selectedDays, list(7, WEEKDAYS)) &&
    optional(body.trainerLocation, list(10)) &&
    optional(body.specificFocusAreas, list(10)) &&
    optional(body.injuries, text) &&
    optional(body.additionalNotes, text) &&
    optional(body.age, numberIn(5, 120)) &&
    optional(body.gender, oneOf(GENDERS))
  );
}

export function isValidNutritionBody(body: unknown): boolean {
  if (!isObject(body)) return false;
  return (
    optional(body.language, oneOf(LANGUAGES)) &&
    optional(body.dietGoal, oneOf(DIET_GOALS)) &&
    optional(body.caloriesPerDay, numberIn(500, 10000)) &&
    optional(body.budgetPerWeek, numberIn(0, 100000)) &&
    optional(body.mealsPerDay, numberIn(1, 10)) &&
    optional(body.dietaryRestrictions, list(20)) &&
    optional(body.allergies, list(20)) &&
    optional(body.preferredCuisines, list(20)) &&
    optional(body.additionalNotes, text) &&
    optional(body.age, numberIn(5, 120)) &&
    optional(body.gender, oneOf(GENDERS))
  );
}
