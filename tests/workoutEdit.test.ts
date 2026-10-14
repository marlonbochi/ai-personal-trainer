import { describe, it, expect } from 'vitest';
import {
  parseStoredWorkout, serializeWorkout, removeExercise, replaceExercise, addExercise, getRemovedCount,
} from '@/lib/workoutEdit';

const plan = {
  monday: [{ name: 'Squat', description: 'a' }, { name: 'Lunge', description: 'b' }, { name: 'Plank', description: 'c' }],
  tuesday: 'Rest day',
};

describe('parse/serialize', () => {
  it('round-trips the current plain JSON format', () => {
    expect(parseStoredWorkout(serializeWorkout(plan))).toEqual(plan);
  });
  it('persists text outside Latin-1 (en dash, emoji) that btoa would reject', () => {
    const rich = { monday: [{ name: 'Burpee', description: '3 séries – 12 reps 💪' }] };
    expect(() => serializeWorkout(rich)).not.toThrow();
    expect(parseStoredWorkout(serializeWorkout(rich))).toEqual(rich);
  });
  it('reads the legacy base64 (Latin-1) format', () => {
    const legacy = { monday: [{ name: 'Agachamento', description: 'séries ã é' }] };
    expect(parseStoredWorkout(btoa(JSON.stringify(legacy)))).toEqual(legacy);
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
    expect('_meta' in plan).toBe(false);
  });
  it('allows a day to become empty', () => {
    const single = { monday: [{ name: 'Squat' }] };
    expect((removeExercise(single, 'monday', 0) as any).monday).toEqual([]);
  });
  it('ignores rest-day strings, unknown days and bad indexes (no tracking either)', () => {
    expect(removeExercise(plan, 'tuesday', 0)).toBe(plan);
    expect(removeExercise(plan, 'friday', 0)).toBe(plan);
    expect(removeExercise(plan, 'monday', 9)).toBe(plan);
    expect(removeExercise(plan, 'monday', -1)).toBe(plan);
  });
});

describe('removal tracking', () => {
  it('counts removals per day, starting from zero', () => {
    expect(getRemovedCount(plan, 'monday')).toBe(0);
    const once = removeExercise(plan, 'monday', 0);
    const twice = removeExercise(once, 'monday', 0);
    expect(getRemovedCount(once, 'monday')).toBe(1);
    expect(getRemovedCount(twice, 'monday')).toBe(2);
    expect(getRemovedCount(twice, 'tuesday')).toBe(0);
  });
  it('tracks days independently', () => {
    const multi = { monday: [{ name: 'A' }, { name: 'B' }], wednesday: [{ name: 'C' }] };
    const next = removeExercise(removeExercise(multi, 'monday', 0), 'wednesday', 0);
    expect(getRemovedCount(next, 'monday')).toBe(1);
    expect(getRemovedCount(next, 'wednesday')).toBe(1);
  });
  it('survives serialisation', () => {
    const removed = removeExercise(plan, 'monday', 0);
    expect(getRemovedCount(parseStoredWorkout(serializeWorkout(removed))!, 'monday')).toBe(1);
  });
  it('does not turn _meta into a day (non-array value)', () => {
    const removed = removeExercise(plan, 'monday', 0);
    expect(Array.isArray(removed._meta)).toBe(false);
  });
});

describe('addExercise', () => {
  it('appends to the end of the day and decrements the counter', () => {
    const removed = removeExercise(plan, 'monday', 0);
    const next = addExercise(removed, 'monday', { name: 'Goblet Squat', description: 'x' }) as typeof plan;
    expect(next.monday.map(e => e.name)).toEqual(['Lunge', 'Plank', 'Goblet Squat']);
    expect(getRemovedCount(next, 'monday')).toBe(0);
  });
  it('drops _meta once nothing is tracked, restoring the original shape', () => {
    const next = addExercise(removeExercise(plan, 'monday', 0), 'monday', { name: 'X' });
    expect('_meta' in next).toBe(false);
  });
  it('keeps the counter for other days and for remaining removals', () => {
    const multi = { monday: [{ name: 'A' }, { name: 'B' }], wednesday: [{ name: 'C' }] };
    const removed = removeExercise(removeExercise(removeExercise(multi, 'monday', 0), 'monday', 0), 'wednesday', 0);
    const next = addExercise(removed, 'monday', { name: 'N' });
    expect(getRemovedCount(next, 'monday')).toBe(1);
    expect(getRemovedCount(next, 'wednesday')).toBe(1);
  });
  it('never goes below zero and ignores non-array days', () => {
    const next = addExercise(plan, 'monday', { name: 'N' });
    expect(getRemovedCount(next, 'monday')).toBe(0);
    expect(addExercise(plan, 'tuesday', { name: 'N' })).toBe(plan);
  });
  it('does not mutate the original plan', () => {
    const removed = removeExercise(plan, 'monday', 0);
    const before = JSON.stringify(removed);
    addExercise(removed, 'monday', { name: 'N' });
    expect(JSON.stringify(removed)).toBe(before);
  });
});

describe('replaceExercise', () => {
  it('replaces in place, preserving position and other days', () => {
    const next = replaceExercise(plan, 'monday', 1, { name: 'Step-up', description: 'x' }) as typeof plan;
    expect(next.monday.map(e => e.name)).toEqual(['Squat', 'Step-up', 'Plank']);
    expect(next.tuesday).toBe('Rest day');
  });
  it('does not change the removal counter', () => {
    const removed = removeExercise(plan, 'monday', 0);
    const next = replaceExercise(removed, 'monday', 0, { name: 'Step-up' });
    expect(getRemovedCount(next, 'monday')).toBe(1);
  });
  it('ignores invalid targets', () => {
    expect(replaceExercise(plan, 'tuesday', 0, { name: 'X' })).toBe(plan);
    expect((replaceExercise(plan, 'monday', 5, { name: 'X' }) as typeof plan).monday.map(e => e.name)).toEqual(['Squat', 'Lunge', 'Plank']);
  });
});
