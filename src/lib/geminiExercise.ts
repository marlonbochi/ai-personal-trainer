import { generateWithFallback } from './gemini';
import { parseReplacement } from './replaceExercise';
import type { Exercise } from './workoutEdit';

// Server-only (see ./gemini). One exercise, with automatic model fallback.
export async function requestExercise(prompt: string): Promise<Exercise> {
  const { result } = await generateWithFallback(
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
    },
    text => {
      const exercise = parseReplacement(text);
      if (!exercise) throw new Error('Invalid exercise');
      return exercise;
    },
    { timeoutMs: 45000 }
  );
  return result;
}
