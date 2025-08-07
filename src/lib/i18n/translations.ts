import { Language } from './config';

export type TranslationKey =
  | 'app.name'
  | 'nav.home'
  | 'nav.generateWorkout'
  | 'workout.noWorkout'
  | 'workout.generatePrompt'
  | 'language.english'
  | 'language.portuguese'
  | 'language.select' 
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
  | 'workout.cancelButton'
  | 'workout.days'
  | 'workout.levels.beginner'
  | 'workout.levels.intermediate'
  | 'workout.levels.advanced'
  | 'workout.goals.weightLoss'
  | 'workout.goals.muscleGain'
  | 'workout.goals.endurance'
  | 'workout.goals.strength'
  | 'workout.equipment.gym'
  | 'workout.equipment.homeWorkout'
  | 'workout.equipment.dumbbells'
  | 'workout.equipment.barbell'
  | 'workout.equipment.kettlebells'
  | 'workout.equipment.resistanceBands'
  | 'workout.equipment.yogaMat'
  | 'workout.equipment.pullUpBar'
  | 'workout.focusAreas.chest'
  | 'workout.focusAreas.back'
  | 'workout.focusAreas.legs'
  | 'workout.focusAreas.shoulders'
  | 'workout.focusAreas.arms'
  | 'workout.focusAreas.core'
  | 'workout.focusAreas.cardio'
  | 'workout.daysOfWeek.monday'
  | 'workout.daysOfWeek.tuesday'
  | 'workout.daysOfWeek.wednesday'
  | 'workout.daysOfWeek.thursday'
  | 'workout.daysOfWeek.friday'
  | 'workout.daysOfWeek.saturday'
  | 'workout.daysOfWeek.sunday'
  | 'workout.age'
  | 'workout.gender'
  | 'workout.genderMale'
  | 'workout.genderFemale'
  | 'pwa.installTitle'
  | 'pwa.installDescription'
  | 'pwa.installButton'
  | 'pwa.notNowButton';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'app.name': 'AI Trainer',
    'nav.home': 'My Workouts',
    'nav.generateWorkout': 'New Workout',
    'workout.noWorkout': 'No workout found',
    'workout.generatePrompt': 'Generate a new workout plan to get started',
    'language.english': 'English',
    'language.portuguese': 'Portuguese',
    'language.select': 'Select Language',
    // Days of the week
    'workout.daysOfWeek.monday': 'Monday',
    'workout.daysOfWeek.tuesday': 'Tuesday',
    'workout.daysOfWeek.wednesday': 'Wednesday',
    'workout.daysOfWeek.thursday': 'Thursday',
    'workout.daysOfWeek.friday': 'Friday',
    'workout.daysOfWeek.saturday': 'Saturday',
    'workout.daysOfWeek.sunday': 'Sunday',
    
    'workout.title': 'Workout Plan',
    'workout.tagline': 'Get your personalized workout plan based on your goals and preferences',
    'workout.getStarted': 'Get Started',
    'workout.generateButton': 'Generate Workout Plan',
    'pwa.installTitle': 'Install App',
    'pwa.installDescription': 'Add this app to your home screen for quick access',
    'pwa.installButton': 'Install',
    'pwa.notNowButton': 'Not now',
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
    'workout.generatePlan': 'Generate',
    'workout.cancelButton': 'Cancel',
    'workout.days': 'days',
    'workout.levels.beginner': 'Beginner',
    'workout.levels.intermediate': 'Intermediate',
    'workout.levels.advanced': 'Advanced',
    'workout.goals.weightLoss': 'Weight Loss',
    'workout.goals.muscleGain': 'Muscle Gain',
    'workout.goals.endurance': 'Endurance',
    'workout.goals.strength': 'Strength',
    'workout.equipment.gym': 'Gym Equipment',
    'workout.equipment.homeWorkout': 'Home Workout',
    'workout.equipment.dumbbells': 'Dumbbells',
    'workout.equipment.barbell': 'Barbell',
    'workout.equipment.kettlebells': 'Kettlebells',
    'workout.equipment.resistanceBands': 'Resistance Bands',
    'workout.equipment.yogaMat': 'Yoga Mat',
    'workout.equipment.pullUpBar': 'Pull-up Bar',
    'workout.focusAreas.chest': 'Chest',
    'workout.focusAreas.back': 'Back',
    'workout.focusAreas.legs': 'Legs',
    'workout.focusAreas.shoulders': 'Shoulders',
    'workout.focusAreas.arms': 'Arms',
    'workout.focusAreas.core': 'Core',
    'workout.focusAreas.cardio': 'Cardio',
    'workout.age': 'Age',
    'workout.gender': 'Gender',
    'workout.genderMale': 'Male',
    'workout.genderFemale': 'Female',
  },
  pt: {
    'app.name': 'AI Trainer',
    'nav.home': 'Meus Treinos',
    'nav.generateWorkout': 'Novo Treino',
    'workout.noWorkout': 'Nenhum treino encontrado',
    'workout.generatePrompt': 'Gere um novo plano de treino para começar',
    'language.english': 'Inglês',
    'language.portuguese': 'Português',
    'language.select': 'Selecionar Idioma',
    // Days of the week
    'workout.daysOfWeek.monday': 'Segunda-feira',
    'workout.daysOfWeek.tuesday': 'Terça-feira',
    'workout.daysOfWeek.wednesday': 'Quarta-feira',
    'workout.daysOfWeek.thursday': 'Quinta-feira',
    'workout.daysOfWeek.friday': 'Sexta-feira',
    'workout.daysOfWeek.saturday': 'Sábado',
    'workout.daysOfWeek.sunday': 'Domingo',
    
    'workout.title': 'Plano de Treino',
    'workout.tagline': 'Obtenha seu plano de treino personalizado com base em seus objetivos e preferências',
    'workout.getStarted': 'Começar',
    'workout.generateButton': 'Gerar Plano de Treino',
    'pwa.installTitle': 'Instalar Aplicativo',
    'pwa.installDescription': 'Adicione este aplicativo à tela inicial para acesso rápido',
    'pwa.installButton': 'Instalar',
    'pwa.notNowButton': 'Agora não',
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
    'workout.generatePlan': 'Gerar',
    'workout.cancelButton': 'Cancelar',
    'workout.days': 'dias',
    'workout.levels.beginner': 'Iniciante',
    'workout.levels.intermediate': 'Intermediário',
    'workout.levels.advanced': 'Avançado',
    'workout.goals.weightLoss': 'Perda de Peso',
    'workout.goals.muscleGain': 'Ganho de Massa Muscular',
    'workout.goals.endurance': 'Resistência',
    'workout.goals.strength': 'Força',
    'workout.equipment.gym': 'Academia',
    'workout.equipment.homeWorkout': 'Treino em Casa',
    'workout.equipment.dumbbells': 'Halteres',
    'workout.equipment.barbell': 'Barra',
    'workout.equipment.kettlebells': 'Kettlebells',
    'workout.equipment.resistanceBands': 'Faixas de Resistência',
    'workout.equipment.yogaMat': 'Tapete de Yoga',
    'workout.equipment.pullUpBar': 'Barra Fixa',
    'workout.focusAreas.chest': 'Peito',
    'workout.focusAreas.back': 'Costas',
    'workout.focusAreas.legs': 'Pernas',
    'workout.focusAreas.shoulders': 'Ombros',
    'workout.focusAreas.arms': 'Braços',
    'workout.focusAreas.core': 'Core/Abdômen',
    'workout.focusAreas.cardio': 'Cardio',
    'workout.age': 'Idade',
    'workout.gender': 'Gênero',
    'workout.genderMale': 'Masculino',
    'workout.genderFemale': 'Feminino',
  }
};

export default translations;
