// Maps the keys Gemini uses in a meal plan (any case, accents, separators, en or pt)
// to canonical ids, so the page can show labels in the current UI language.

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type MealId =
  | 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack'
  | 'dinner' | 'supper' | 'snacks' | 'preWorkout' | 'postWorkout';

// 'morningSnack', 'Café da manhã', 'cafe_da_manha' -> 'morning snack', 'cafe da manha', 'cafe da manha'
export function normalizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const WEEKDAY_ALIASES: Record<string, Weekday> = {
  monday: 'monday', segunda: 'monday',
  tuesday: 'tuesday', terca: 'tuesday',
  wednesday: 'wednesday', quarta: 'wednesday',
  thursday: 'thursday', quinta: 'thursday',
  friday: 'friday', sexta: 'friday',
  saturday: 'saturday', sabado: 'saturday',
  sunday: 'sunday', domingo: 'sunday',
};

const MEAL_ALIASES: Record<string, MealId> = {
  'breakfast': 'breakfast', 'cafe da manha': 'breakfast', 'desjejum': 'breakfast',
  'morning snack': 'morningSnack', 'mid morning snack': 'morningSnack', 'lanche da manha': 'morningSnack', 'colacao': 'morningSnack',
  'lunch': 'lunch', 'almoco': 'lunch',
  'afternoon snack': 'afternoonSnack', 'lanche da tarde': 'afternoonSnack',
  'dinner': 'dinner', 'jantar': 'dinner',
  'supper': 'supper', 'evening snack': 'supper', 'ceia': 'supper',
  'snack': 'snacks', 'snacks': 'snacks', 'lanche': 'snacks', 'lanches': 'snacks',
  'pre workout': 'preWorkout', 'pre treino': 'preWorkout',
  'post workout': 'postWorkout', 'pos treino': 'postWorkout',
};

export function weekdayId(key: string): Weekday | null {
  // 'segunda feira' and 'segunda' are the same day.
  const name = normalizeKey(key).replace(/ feira$/, '');
  return WEEKDAY_ALIASES[name] ?? null;
}

export function mealId(key: string): MealId | null {
  return MEAL_ALIASES[normalizeKey(key)] ?? null;
}
