import { describe, it, expect } from 'vitest';
import { buildReplacePrompt, parseReplacement, isValidReplaceBody } from '@/lib/replaceExercise';

const base = { language: 'en' as const, exercise: { name: 'Leg Press', description: '3x12' }, otherExercises: ['Squat', 'Lunge'] };

describe('buildReplacePrompt', () => {
  it('includes the exercise, the other exercises and the reason', () => {
    const p = buildReplacePrompt({ ...base, reason: 'no machine' });
    expect(p).toContain('Leg Press');
    expect(p).toContain('Squat, Lunge');
    expect(p).toContain('no machine');
    expect(p).toContain('English');
  });
  it('asks for plain text without markdown', () => {
    expect(buildReplacePrompt(base)).toContain('no markdown');
    expect(buildReplacePrompt({ ...base, language: 'pt' })).toContain('sem markdown');
  });
  it('omits the reason line when not given', () => {
    expect(buildReplacePrompt(base)).not.toContain('Reason for replacing');
  });
  it('writes in Brazilian Portuguese for pt', () => {
    const p = buildReplacePrompt({ ...base, language: 'pt', reason: 'sem máquina' });
    expect(p).toContain('português do Brasil');
    expect(p).toContain('sem máquina');
  });
});

describe('parseReplacement', () => {
  it('parses plain JSON', () => {
    expect(parseReplacement('{"name":"Goblet Squat","description":"3x12"}')).toEqual({ name: 'Goblet Squat', description: '3x12' });
  });
  it('parses JSON wrapped in code fences', () => {
    expect(parseReplacement('```json\n{"name":"A","description":"B"}\n```')).toEqual({ name: 'A', description: 'B' });
  });
  it('rejects malformed or incomplete replies', () => {
    expect(parseReplacement('sorry')).toBeNull();
    expect(parseReplacement('{"name":"","description":"x"}')).toBeNull();
    expect(parseReplacement('{"name":"A"}')).toBeNull();
  });
});

describe('isValidReplaceBody', () => {
  it('accepts a well-formed body', () => {
    expect(isValidReplaceBody(base)).toBe(true);
  });
  it('rejects bad shapes and oversize input', () => {
    expect(isValidReplaceBody(undefined)).toBe(false);
    expect(isValidReplaceBody({ ...base, language: 'fr' })).toBe(false);
    expect(isValidReplaceBody({ ...base, exercise: { name: '' } })).toBe(false);
    expect(isValidReplaceBody({ ...base, otherExercises: [1] })).toBe(false);
    expect(isValidReplaceBody({ ...base, reason: 'x'.repeat(501) })).toBe(false);
  });
});
