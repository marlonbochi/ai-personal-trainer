export interface Exercise {
  name: string;
  description?: string;
}

export interface WorkoutMeta {
  removed?: Record<string, number>;
}

export type WorkoutPlan = Record<string, unknown>;

const META_KEY = '_meta';

function decodeBase64Utf8(value: string): string {
  const binary = atob(value);
  try {
    return decodeURIComponent(escape(binary));
  } catch {
    return binary;
  }
}

export function parseStoredWorkout(stored: string | null): WorkoutPlan | null {
  if (!stored) return null;
  // Plain JSON is the current format; base64 is the legacy one.
  const attempts = [() => stored, () => decodeBase64Utf8(stored)];
  for (const decode of attempts) {
    try {
      const parsed = JSON.parse(decode());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // try next format
    }
  }
  return null;
}

export function serializeWorkout(plan: WorkoutPlan): string {
  return JSON.stringify(plan);
}

function withDay(plan: WorkoutPlan, day: string, update: (exercises: unknown[]) => unknown[]): WorkoutPlan {
  const exercises = plan[day];
  if (!Array.isArray(exercises)) return plan;
  return { ...plan, [day]: update(exercises) };
}

export function getRemovedCount(plan: WorkoutPlan, day: string): number {
  const meta = plan[META_KEY] as WorkoutMeta | undefined;
  const count = meta?.removed?.[day];
  return typeof count === 'number' && count > 0 ? count : 0;
}

function adjustRemoved(plan: WorkoutPlan, day: string, delta: number): WorkoutPlan {
  const meta = (plan[META_KEY] as WorkoutMeta | undefined) ?? {};
  const removed = { ...(meta.removed ?? {}) };
  const next = Math.max(0, getRemovedCount(plan, day) + delta);
  if (next === 0) delete removed[day];
  else removed[day] = next;

  const { [META_KEY]: _discard, ...rest } = plan;
  if (Object.keys(removed).length === 0) return rest;
  return { ...rest, [META_KEY]: { ...meta, removed } };
}

export function removeExercise(plan: WorkoutPlan, day: string, index: number): WorkoutPlan {
  const exercises = plan[day];
  if (!Array.isArray(exercises) || index < 0 || index >= exercises.length) return plan;
  const next = withDay(plan, day, list => list.filter((_, i) => i !== index));
  return adjustRemoved(next, day, 1);
}

export function replaceExercise(plan: WorkoutPlan, day: string, index: number, exercise: Exercise): WorkoutPlan {
  return withDay(plan, day, exercises =>
    index >= 0 && index < exercises.length ? exercises.map((e, i) => (i === index ? exercise : e)) : exercises
  );
}

export function addExercise(plan: WorkoutPlan, day: string, exercise: Exercise): WorkoutPlan {
  if (!Array.isArray(plan[day])) return plan;
  const next = withDay(plan, day, exercises => [...exercises, exercise]);
  return adjustRemoved(next, day, -1);
}
