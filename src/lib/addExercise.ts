export type Language = 'en' | 'pt';

export interface WorkoutContext {
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goal?: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength';
  duration?: string;
  trainerLocation?: string[];
  specificFocusAreas?: string[];
  injuries?: string;
  additionalNotes?: string;
  age?: number;
  gender?: 'male' | 'female';
}

export interface AddRequest {
  language: Language;
  day?: string;
  otherExercises: string[];
  description?: string;
  context?: unknown;
}

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const GOALS = ['weight_loss', 'muscle_gain', 'endurance', 'strength'] as const;
const GENDERS = ['male', 'female'] as const;
const DURATION = /^\d{1,3}_min$/;

function text(value: unknown, max: number): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;
}

function list(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((v): v is string => typeof v === 'string' && v.length > 0 && v.length <= 50).slice(0, 10);
  return items.length > 0 ? items : undefined;
}

// Whitelists and bounds whatever the client sends (or what is stored in localStorage).
export function sanitizeContext(raw: unknown): WorkoutContext {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  const ctx: WorkoutContext = {};
  if (LEVELS.includes(r.fitnessLevel as never)) ctx.fitnessLevel = r.fitnessLevel as WorkoutContext['fitnessLevel'];
  if (GOALS.includes(r.goal as never)) ctx.goal = r.goal as WorkoutContext['goal'];
  if (typeof r.duration === 'string' && DURATION.test(r.duration)) ctx.duration = r.duration;
  const location = list(r.trainerLocation);
  if (location) ctx.trainerLocation = location;
  const focus = list(r.specificFocusAreas);
  if (focus) ctx.specificFocusAreas = focus;
  const injuries = text(r.injuries, 500);
  if (injuries) ctx.injuries = injuries;
  const notes = text(r.additionalNotes, 500);
  if (notes) ctx.additionalNotes = notes;
  const age = Number(r.age);
  if (Number.isFinite(age) && age >= 10 && age <= 100) ctx.age = Math.round(age);
  if (GENDERS.includes(r.gender as never)) ctx.gender = r.gender as WorkoutContext['gender'];
  return ctx;
}

export function isValidAddBody(body: unknown): body is AddRequest {
  const b = body as AddRequest | undefined;
  return (
    !!b &&
    (b.language === 'en' || b.language === 'pt') &&
    Array.isArray(b.otherExercises) &&
    b.otherExercises.length <= 50 &&
    b.otherExercises.every(n => typeof n === 'string' && n.length <= 200) &&
    (b.day === undefined || (typeof b.day === 'string' && b.day.length <= 30)) &&
    (b.description === undefined || (typeof b.description === 'string' && b.description.length <= 500))
  );
}

export function buildAddPrompt({ language, day, otherExercises, description, context }: AddRequest): string {
  const pt = language === 'pt';
  const ctx = sanitizeContext(context);
  const others = otherExercises.length > 0 ? otherExercises.join(', ') : pt ? 'nenhum' : 'none';
  const lines: string[] = [];

  if (pt) {
    lines.push('Adicione UM novo exercício a um dia de treino. Escreva em português do Brasil e use um nome popular e real de exercício.');
    if (day) lines.push(`Dia: ${day}.`);
    lines.push(`Exercícios que já estão neste dia (NÃO repita nenhum deles): ${others}.`);
    lines.push(description?.trim()
      ? `Pedido do usuário para o novo exercício: ${description.trim()}.`
      : 'O usuário não especificou o que quer: escolha o exercício que melhor complementa o dia.');
    if (ctx.duration) {
      lines.push(`Duração total do treino escolhida: ${ctx.duration.replace('_', ' ')}. Hoje o dia tem ${otherExercises.length} exercício(s); o novo exercício deve ajudar a preencher esse tempo.`);
    }
    if (ctx.fitnessLevel) lines.push(`Nível de condicionamento: ${{ beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' }[ctx.fitnessLevel]}.`);
    if (ctx.goal) lines.push(`Objetivo: ${{ weight_loss: 'Perda de peso', muscle_gain: 'Ganho de massa muscular', endurance: 'Resistência', strength: 'Força' }[ctx.goal]}.`);
    if (ctx.trainerLocation) lines.push(`Local de treino: ${ctx.trainerLocation.join(', ')}.`);
    if (ctx.specificFocusAreas) lines.push(`Áreas de foco: ${ctx.specificFocusAreas.join(', ')}.`);
    if (ctx.injuries) lines.push(`Lesões ou limitações (respeite): ${ctx.injuries}.`);
    if (ctx.additionalNotes) lines.push(`Notas adicionais: ${ctx.additionalNotes}.`);
    if (ctx.age) lines.push(`Idade: ${ctx.age} anos.`);
    if (ctx.gender) lines.push(`Sexo: ${ctx.gender === 'male' ? 'masculino' : 'feminino'}.`);
    lines.push('Responda SOMENTE com um objeto JSON válido no formato {"name": "...", "description": "..."}, onde a descrição inclui séries, repetições, descanso e dicas de execução. A descrição deve falar apenas do exercício, em texto corrido simples, sem markdown (sem **, # ou listas) e sem repetir ou comentar o pedido do usuário.');
  } else {
    lines.push('Add ONE new exercise to a workout day. Write in English and use a popular, real exercise name.');
    if (day) lines.push(`Day: ${day}.`);
    lines.push(`Exercises already in this day (do NOT repeat any of them): ${others}.`);
    lines.push(description?.trim()
      ? `User request for the new exercise: ${description.trim()}.`
      : 'The user did not specify what they want: pick the exercise that best complements the day.');
    if (ctx.duration) {
      lines.push(`Chosen total workout duration: ${ctx.duration.replace('_', ' ')}. The day currently has ${otherExercises.length} exercise(s); the new exercise should help fill that time.`);
    }
    if (ctx.fitnessLevel) lines.push(`Fitness level: ${ctx.fitnessLevel}.`);
    if (ctx.goal) lines.push(`Goal: ${ctx.goal.split('_').join(' ')}.`);
    if (ctx.trainerLocation) lines.push(`Training location: ${ctx.trainerLocation.join(', ')}.`);
    if (ctx.specificFocusAreas) lines.push(`Focus areas: ${ctx.specificFocusAreas.join(', ')}.`);
    if (ctx.injuries) lines.push(`Injuries or limitations (respect them): ${ctx.injuries}.`);
    if (ctx.additionalNotes) lines.push(`Additional notes: ${ctx.additionalNotes}.`);
    if (ctx.age) lines.push(`Age: ${ctx.age}.`);
    if (ctx.gender) lines.push(`Gender: ${ctx.gender}.`);
    lines.push('Reply ONLY with a valid JSON object in the format {"name": "...", "description": "..."}, where the description includes sets, reps, rest and form tips. The description must be about the exercise only, in plain running text with no markdown (no **, # or lists), and must not repeat or comment on the user request.');
  }

  return lines.join('\n');
}
