export interface Exercise {
  name: string;
  description?: string;
}

export type WorkoutPlan = Record<string, unknown>;

export function parseStoredWorkout(stored: string | null): WorkoutPlan | null {
  if (!stored) return null;
  const attempts = [() => atob(stored), () => stored];
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
  return btoa(JSON.stringify(plan));
}

function withDay(plan: WorkoutPlan, day: string, update: (exercises: unknown[]) => unknown[]): WorkoutPlan {
  const exercises = plan[day];
  if (!Array.isArray(exercises)) return plan;
  return { ...plan, [day]: update(exercises) };
}

export function removeExercise(plan: WorkoutPlan, day: string, index: number): WorkoutPlan {
  return withDay(plan, day, exercises =>
    index >= 0 && index < exercises.length ? exercises.filter((_, i) => i !== index) : exercises
  );
}

export function replaceExercise(plan: WorkoutPlan, day: string, index: number, exercise: Exercise): WorkoutPlan {
  return withDay(plan, day, exercises =>
    index >= 0 && index < exercises.length ? exercises.map((e, i) => (i === index ? exercise : e)) : exercises
  );
}
