import { describe, it, expect } from 'vitest';
import { isValidWorkoutBody, isValidNutritionBody } from '@/lib/requestValidation';

const workout = {
  language: 'pt', fitnessLevel: 'intermediate', goal: 'muscle_gain', duration: '90_min',
  selectedDays: ['monday', 'wednesday', 'friday'], trainerLocation: ['gym'], specificFocusAreas: ['legs'],
  injuries: '', additionalNotes: 'ok', age: 30, gender: 'male',
};
const nutrition = {
  language: 'en', dietGoal: 'maintenance', caloriesPerDay: 2000, budgetPerWeek: 100, mealsPerDay: 3,
  dietaryRestrictions: ['vegetarian'], allergies: [], preferredCuisines: ['italian'], additionalNotes: '', age: 30, gender: 'female',
};

describe('isValidWorkoutBody', () => {
  it('accepts what the form sends, including numbers as strings and pt weekday names', () => {
    expect(isValidWorkoutBody(workout)).toBe(true);
    expect(isValidWorkoutBody({ ...workout, age: '35', daysPerWeek: '3' })).toBe(true);
    expect(isValidWorkoutBody({ ...workout, selectedDays: ['segunda-feira', 'terça-feira', 'sábado'] })).toBe(true);
  });
  it('accepts an empty object (all fields have server defaults)', () => {
    expect(isValidWorkoutBody({})).toBe(true);
  });
  it('rejects non-objects', () => {
    for (const bad of [null, undefined, 'x', 5, [], [workout]]) expect(isValidWorkoutBody(bad)).toBe(false);
  });
  it('rejects wrong types and values outside the allow-lists', () => {
    expect(isValidWorkoutBody({ ...workout, fitnessLevel: 'god' })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, goal: 5 })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, duration: '9999_min' })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, selectedDays: 'monday' })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, selectedDays: ['funday'] })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, gender: 'robot' })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, language: 'fr' })).toBe(false);
  });
  it('bounds numbers, text and list sizes', () => {
    expect(isValidWorkoutBody({ ...workout, age: 500 })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, age: 'abc' })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, age: '' })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, injuries: 'x'.repeat(501) })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, additionalNotes: 'x'.repeat(501) })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, trainerLocation: Array(11).fill('gym') })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, specificFocusAreas: ['x'.repeat(51)] })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, selectedDays: Array(8).fill('monday') })).toBe(false);
  });
  it('rejects non-string list items (type confusion)', () => {
    expect(isValidWorkoutBody({ ...workout, trainerLocation: [{ a: 1 }] })).toBe(false);
    expect(isValidWorkoutBody({ ...workout, specificFocusAreas: [1] })).toBe(false);
  });
});

describe('isValidNutritionBody', () => {
  it('accepts what the form sends', () => {
    expect(isValidNutritionBody(nutrition)).toBe(true);
    expect(isValidNutritionBody({ ...nutrition, age: '40', mealsPerDay: '4' })).toBe(true);
  });
  it('rejects bad enums, numbers and sizes', () => {
    expect(isValidNutritionBody({ ...nutrition, dietGoal: 'bulk' })).toBe(false);
    expect(isValidNutritionBody({ ...nutrition, caloriesPerDay: 50 })).toBe(false);
    expect(isValidNutritionBody({ ...nutrition, caloriesPerDay: 1e9 })).toBe(false);
    expect(isValidNutritionBody({ ...nutrition, mealsPerDay: 0 })).toBe(false);
    expect(isValidNutritionBody({ ...nutrition, allergies: Array(21).fill('a') })).toBe(false);
    expect(isValidNutritionBody({ ...nutrition, additionalNotes: 'x'.repeat(501) })).toBe(false);
    expect(isValidNutritionBody({ ...nutrition, dietaryRestrictions: 'vegan' })).toBe(false);
    expect(isValidNutritionBody(null)).toBe(false);
  });
});
