import { Language } from './config';

export type TranslationKey = 
  | 'workout.title'
  | 'workout.generateButton'
  | 'workout.generating'
  | 'workout.tagline'
  | 'workout.getStarted'
  | 'workout.customizePlan'
  | 'workout.fitnessLevel'
  | 'workout.workoutGoal'
  | 'workout.workoutDuration'
  | 'workout.daysPerWeek'
  | 'workout.availableEquipment'
  | 'workout.specificFocusAreas'
  | 'workout.injuries'
  | 'workout.injuriesPlaceholder'
  | 'workout.additionalNotes'
  | 'workout.additionalNotesPlaceholder'
  | 'workout.generatePlan'
  | 'workout.days'
  | 'workout.levels.beginner'
  | 'workout.levels.intermediate'
  | 'workout.levels.advanced'
  | 'workout.goals.weightLoss'
  | 'workout.goals.muscleGain'
  | 'workout.goals.endurance'
  | 'workout.goals.strength'
  | 'workout.equipment.dumbbells'
  | 'workout.equipment.barbell'
  | 'workout.equipment.kettlebells'
  | 'workout.equipment.resistanceBands'
  | 'workout.equipment.yogaMat'
  | 'workout.equipment.pullUpBar'
  | 'workout.equipment.none'
  | 'workout.focusAreas.chest'
  | 'workout.focusAreas.back'
  | 'workout.focusAreas.legs'
  | 'workout.focusAreas.shoulders'
  | 'workout.focusAreas.arms'
  | 'workout.focusAreas.core'
  | 'workout.focusAreas.cardio';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'workout.title': 'AI Workout Plan',
    'workout.tagline': 'Get your personalized workout plan based on your goals and preferences',
    'workout.getStarted': 'Get Started',
    'workout.generateButton': 'Generate Workout Plan',
    'workout.generating': 'Generating...',
    'workout.customizePlan': 'Customize Your Workout Plan',
    'workout.fitnessLevel': 'Your Fitness Level',
    'workout.workoutGoal': 'Workout Goal',
    'workout.workoutDuration': 'Workout Duration',
    'workout.daysPerWeek': 'Workout Days Per Week',
    'workout.availableEquipment': 'Available Equipment',
    'workout.specificFocusAreas': 'Specific Focus Areas',
    'workout.injuries': 'Injuries or Limitations',
    'workout.injuriesPlaceholder': 'List any injuries or physical limitations',
    'workout.additionalNotes': 'Additional Notes',
    'workout.additionalNotesPlaceholder': 'Any other preferences or requirements',
    'workout.generatePlan': 'Generate My Workout Plan',
    'workout.days': 'days',
    'workout.levels.beginner': 'Beginner',
    'workout.levels.intermediate': 'Intermediate',
    'workout.levels.advanced': 'Advanced',
    'workout.goals.weightLoss': 'Weight Loss',
    'workout.goals.muscleGain': 'Muscle Gain',
    'workout.goals.endurance': 'Endurance',
    'workout.goals.strength': 'Strength',
    'workout.equipment.dumbbells': 'Dumbbells',
    'workout.equipment.barbell': 'Barbell',
    'workout.equipment.kettlebells': 'Kettlebells',
    'workout.equipment.resistanceBands': 'Resistance Bands',
    'workout.equipment.yogaMat': 'Yoga Mat',
    'workout.equipment.pullUpBar': 'Pull-up Bar',
    'workout.equipment.none': 'No Equipment',
    'workout.focusAreas.chest': 'Chest',
    'workout.focusAreas.back': 'Back',
    'workout.focusAreas.legs': 'Legs',
    'workout.focusAreas.shoulders': 'Shoulders',
    'workout.focusAreas.arms': 'Arms',
    'workout.focusAreas.core': 'Core',
    'workout.focusAreas.cardio': 'Cardio',
  },
  pt: {
    'workout.title': 'Plano de Treino AI',
    'workout.tagline': 'Obtenha seu plano de treino personalizado com base em seus objetivos e preferências',
    'workout.getStarted': 'Começar Agora',
    'workout.generateButton': 'Gerar Plano de Treino',
    'workout.generating': 'Gerando...',
    'workout.customizePlan': 'Personalize Seu Plano de Treino',
    'workout.fitnessLevel': 'Seu Nível de Condicionamento',
    'workout.workoutGoal': 'Objetivo do Treino',
    'workout.workoutDuration': 'Duração do Treino',
    'workout.daysPerWeek': 'Dias de Treino por Semana',
    'workout.availableEquipment': 'Equipamentos Disponíveis',
    'workout.specificFocusAreas': 'Áreas de Foco Específicas',
    'workout.injuries': 'Lesões ou Limitações',
    'workout.injuriesPlaceholder': 'Liste quaisquer lesões ou limitações físicas',
    'workout.additionalNotes': 'Observações Adicionais',
    'workout.additionalNotesPlaceholder': 'Quaisquer outras preferências ou requisitos',
    'workout.generatePlan': 'Gerar Meu Plano de Treino',
    'workout.days': 'dias',
    'workout.levels.beginner': 'Iniciante',
    'workout.levels.intermediate': 'Intermediário',
    'workout.levels.advanced': 'Avançado',
    'workout.goals.weightLoss': 'Perda de Peso',
    'workout.goals.muscleGain': 'Ganho de Massa Muscular',
    'workout.goals.endurance': 'Resistência',
    'workout.goals.strength': 'Força',
    'workout.equipment.dumbbells': 'Halteres',
    'workout.equipment.barbell': 'Barra',
    'workout.equipment.kettlebells': 'Kettlebells',
    'workout.equipment.resistanceBands': 'Elásticos',
    'workout.equipment.yogaMat': 'Tapete de Yoga',
    'workout.equipment.pullUpBar': 'Barra Fixa',
    'workout.equipment.none': 'Sem Equipamento',
    'workout.focusAreas.chest': 'Peito',
    'workout.focusAreas.back': 'Costas',
    'workout.focusAreas.legs': 'Pernas',
    'workout.focusAreas.shoulders': 'Ombros',
    'workout.focusAreas.arms': 'Braços',
    'workout.focusAreas.core': 'Core/Abdômen',
    'workout.focusAreas.cardio': 'Cardio',
  }
};

export default translations;
