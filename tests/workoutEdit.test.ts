import { describe, it, expect } from 'vitest';
import { parseStoredWorkout, serializeWorkout, removeExercise, replaceExercise } from '@/lib/workoutEdit';

const plan = {
  monday: [{ name: 'Squat', description: 'a' }, { name: 'Lunge', description: 'b' }, { name: 'Plank', description: 'c' }],
  tuesday: 'Rest day',
};

describe('parse/serialize', () => {
  it('round-trips the base64 format used by generate-workout', () => {
    expect(parseStoredWorkout(serializeWorkout(plan))).toEqual(plan);
  });
  it('reads legacy plain JSON', () => {
    expect(parseStoredWorkout(JSON.stringify(plan))).toEqual(plan);
  });
  it('returns null for empty, invalid or non-object data', () => {
    expect(parseStoredWorkout(null)).toBeNull();
    expect(parseStoredWorkout('not json')).toBeNull();
    expect(parseStoredWorkout(JSON.stringify([1, 2]))).toBeNull();
  });
});

describe('removeExercise', () => {
  it('removes only the given index and keeps order', () => {
    const next = removeExercise(plan, 'monday', 1) as typeof plan;
    expect(next.monday.map(e => e.name)).toEqual(['Squat', 'Plank']);
  });
  it('does not mutate the original plan', () => {
    removeExercise(plan, 'monday', 0);
    expect(plan.monday).toHaveLength(3);
  });
  it('allows a day to become empty', () => {
    const single = { monday: [{ name: 'Squat' }] };
    expect(removeExercise(single, 'monday', 0)).toEqual({ monday: [] });
  });
  it('ignores rest-day strings, unknown days and bad indexes', () => {
    expect(removeExercise(plan, 'tuesday', 0)).toBe(plan);
    expect(removeExercise(plan, 'friday', 0)).toBe(plan);
    expect((removeExercise(plan, 'monday', 9) as typeof plan).monday).toHaveLength(3);
    expect((removeExercise(plan, 'monday', -1) as typeof plan).monday).toHaveLength(3);
  });
});

describe('replaceExercise', () => {
  it('replaces in place, preserving position and other days', () => {
    const next = replaceExercise(plan, 'monday', 1, { name: 'Step-up', description: 'x' }) as typeof plan;
    expect(next.monday.map(e => e.name)).toEqual(['Squat', 'Step-up', 'Plank']);
    expect(next.tuesday).toBe('Rest day');
  });
  it('ignores invalid targets', () => {
    expect(replaceExercise(plan, 'tuesday', 0, { name: 'X' })).toBe(plan);
    expect((replaceExercise(plan, 'monday', 5, { name: 'X' }) as typeof plan).monday.map(e => e.name)).toEqual(['Squat', 'Lunge', 'Plank']);
  });
});
