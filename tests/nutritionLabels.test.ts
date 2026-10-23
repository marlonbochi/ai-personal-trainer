import { describe, it, expect } from 'vitest';
import { weekdayId, mealId } from '@/lib/nutritionLabels';

describe('weekdayId', () => {
  it.each([
    ['monday', 'monday'],
    ['Monday', 'monday'],
    ['Segunda-feira', 'monday'],
    ['segunda', 'monday'],
    ['Terça-feira', 'tuesday'],
    ['terca-feira', 'tuesday'],
    ['Quarta Feira', 'wednesday'],
    ['quinta-feira', 'thursday'],
    ['Sexta-feira', 'friday'],
    ['Sábado', 'saturday'],
    ['sabado', 'saturday'],
    ['Domingo', 'sunday'],
    ['SUNDAY', 'sunday'],
  ])('%s -> %s', (key, want) => {
    expect(weekdayId(key)).toBe(want);
  });

  it.each(['', 'feira', 'Day 1', 'segundas'])('unknown key %j -> null', key => {
    expect(weekdayId(key)).toBeNull();
  });
});

describe('mealId', () => {
  it.each([
    ['Breakfast', 'breakfast'],
    ['breakfast', 'breakfast'],
    ['Café da manhã', 'breakfast'],
    ['cafe_da_manha', 'breakfast'],
    ['Lunch', 'lunch'],
    ['Almoço', 'lunch'],
    [' Almoço ', 'lunch'],
    ['Dinner', 'dinner'],
    ['Jantar', 'dinner'],
    ['Snacks', 'snacks'],
    ['snack', 'snacks'],
    ['Lanches', 'snacks'],
    ['Lanche', 'snacks'],
    ['morningSnack', 'morningSnack'],
    ['Morning Snack', 'morningSnack'],
    ['Lanche da manhã', 'morningSnack'],
    ['afternoon_snack', 'afternoonSnack'],
    ['Lanche da Tarde', 'afternoonSnack'],
    ['Ceia', 'supper'],
    ['Supper', 'supper'],
    ['Pre-workout', 'preWorkout'],
    ['Pré-treino', 'preWorkout'],
    ['post_workout', 'postWorkout'],
    ['Pós-treino', 'postWorkout'],
  ])('%s -> %s', (key, want) => {
    expect(mealId(key)).toBe(want);
  });

  it.each(['', 'Brunch especial', 'Refeição 4', 'lunchbox'])('unknown key %j -> null', key => {
    expect(mealId(key)).toBeNull();
  });
});
