import type { Exercise } from './workoutEdit';

export interface ReplaceRequest {
  language: 'en' | 'pt';
  exercise: Exercise;
  otherExercises: string[];
  reason?: string;
}

export function buildReplacePrompt({ language, exercise, otherExercises, reason }: ReplaceRequest): string {
  const pt = language === 'pt';
  const others = otherExercises.length > 0 ? otherExercises.join(', ') : pt ? 'nenhum' : 'none';
  const reasonLine = reason?.trim()
    ? pt
      ? `Motivo da troca informado pelo usuário: ${reason.trim()}.`
      : `Reason for replacing given by the user: ${reason.trim()}.`
    : '';

  if (pt) {
    return `Substitua UM exercício de um treino. Escreva em português do Brasil e use um nome popular e real de exercício (nunca use palavras como "substituto" ou o nome do exercício original).
Exercício a substituir: "${exercise.name}" - ${exercise.description ?? ''}
${reasonLine}
O substituto deve trabalhar o mesmo grupo muscular, ter dificuldade equivalente e NÃO pode ser igual a nenhum destes exercícios já presentes no dia: ${others}.
Responda SOMENTE com um objeto JSON válido no formato {"name": "...", "description": "..."}, onde a descrição inclui séries, repetições, descanso e dicas de execução.`;
  }
  return `Replace ONE exercise of a workout. Write in English and use a popular, real exercise name (never words like "replacement" or the original exercise name).
Exercise to replace: "${exercise.name}" - ${exercise.description ?? ''}
${reasonLine}
The substitute must target the same muscle group, have equivalent difficulty, and MUST NOT be any of the exercises already in the day: ${others}.
Reply ONLY with a valid JSON object in the format {"name": "...", "description": "..."}, where the description includes sets, reps, rest and form tips.`;
}

export function parseReplacement(text: string): Exercise | null {
  const cleaned = text.replace(/^\s*```(json)?/i, '').replace(/```\s*$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed.name === 'string' && parsed.name.trim() && typeof parsed.description === 'string') {
      return { name: parsed.name.trim(), description: parsed.description.trim() };
    }
  } catch {
    // fallthrough
  }
  return null;
}

export function isValidReplaceBody(body: unknown): body is ReplaceRequest {
  const b = body as ReplaceRequest | undefined;
  return (
    !!b &&
    (b.language === 'en' || b.language === 'pt') &&
    !!b.exercise &&
    typeof b.exercise.name === 'string' &&
    b.exercise.name.length > 0 &&
    b.exercise.name.length <= 200 &&
    Array.isArray(b.otherExercises) &&
    b.otherExercises.length <= 50 &&
    b.otherExercises.every(n => typeof n === 'string') &&
    (b.reason === undefined || (typeof b.reason === 'string' && b.reason.length <= 500))
  );
}
