import { describe, it, expect } from 'vitest';
import { buildAddPrompt, isValidAddBody, sanitizeContext } from '@/lib/addExercise';

const context = {
  fitnessLevel: 'advanced', goal: 'muscle_gain', duration: '90_min', trainerLocation: ['gym'],
  specificFocusAreas: ['legs'], injuries: 'left knee', additionalNotes: 'short rests', age: 34, gender: 'female',
};
const base = { language: 'en' as const, day: 'Monday', otherExercises: ['Squat', 'Lunge'], description: 'a biceps exercise', context };

describe('buildAddPrompt', () => {
  it('includes the other exercises, the user request and the form context', () => {
    const p = buildAddPrompt(base);
    expect(p).toContain('Squat, Lunge');
    expect(p).toContain('a biceps exercise');
    expect(p).toContain('90 min');
    expect(p).toContain('advanced');
    expect(p).toContain('muscle gain');
    expect(p).toContain('gym');
    expect(p).toContain('legs');
    expect(p).toContain('left knee');
    expect(p).toContain('short rests');
    expect(p).toContain('34');
    expect(p).toContain('female');
    expect(p).toContain('Monday');
  });
  it('mentions how many exercises the day currently has relative to the duration', () => {
    expect(buildAddPrompt(base)).toContain('currently has 2 exercise');
  });
  it('works without description and without context', () => {
    const p = buildAddPrompt({ language: 'en', otherExercises: [] });
    expect(p).toContain('did not specify');
    expect(p).toContain('none');
    expect(p).not.toContain('Chosen total workout duration');
  });
  it('is written in Brazilian Portuguese for pt', () => {
    const p = buildAddPrompt({ ...base, language: 'pt', description: 'um exercício de bíceps' });
    expect(p).toContain('português do Brasil');
    expect(p).toContain('um exercício de bíceps');
    expect(p).toContain('Duração total do treino');
    expect(p).toContain('Avançado');
  });
  it('asks for strict JSON output and plain text without markdown', () => {
    const p = buildAddPrompt(base);
    expect(p).toContain('{"name": "...", "description": "..."}');
    expect(p).toContain('no markdown');
    expect(buildAddPrompt({ ...base, language: 'pt' })).toContain('sem markdown');
  });
});

describe('sanitizeContext', () => {
  it('keeps valid fields', () => {
    expect(sanitizeContext(context)).toEqual(context);
  });
  it('drops unknown, invalid and oversized values', () => {
    const out = sanitizeContext({
      fitnessLevel: 'god', goal: 'x', duration: 'forever', age: 500, gender: 'robot',
      trainerLocation: ['x'.repeat(51)], injuries: '   ', isAdmin: true, __proto__: { a: 1 },
    });
    expect(out).toEqual({});
  });
  it('truncates long free text and caps list size', () => {
    const out = sanitizeContext({ injuries: 'x'.repeat(900), specificFocusAreas: Array.from({ length: 30 }, (_, i) => `a${i}`) });
    expect(out.injuries).toHaveLength(500);
    expect(out.specificFocusAreas).toHaveLength(10);
  });
  it('tolerates non-objects', () => {
    expect(sanitizeContext(null)).toEqual({});
    expect(sanitizeContext('x')).toEqual({});
    expect(sanitizeContext(undefined)).toEqual({});
  });
});

describe('isValidAddBody', () => {
  it('accepts a well-formed body, with or without optional fields', () => {
    expect(isValidAddBody(base)).toBe(true);
    expect(isValidAddBody({ language: 'pt', otherExercises: [] })).toBe(true);
  });
  it('rejects bad shapes and oversize input', () => {
    expect(isValidAddBody(undefined)).toBe(false);
    expect(isValidAddBody({ ...base, language: 'fr' })).toBe(false);
    expect(isValidAddBody({ ...base, otherExercises: 'Squat' })).toBe(false);
    expect(isValidAddBody({ ...base, otherExercises: [1] })).toBe(false);
    expect(isValidAddBody({ ...base, otherExercises: Array(51).fill('a') })).toBe(false);
    expect(isValidAddBody({ ...base, description: 'x'.repeat(501) })).toBe(false);
    expect(isValidAddBody({ ...base, day: 'x'.repeat(31) })).toBe(false);
  });
});
