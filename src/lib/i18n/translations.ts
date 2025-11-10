// src/lib/i18n/translations.ts
import { Language } from './config';
import { nutritionTranslations, workoutTranslations, aboutTranslations } from './locales';

// Helper function to flatten nested translation objects
function flattenTranslations(translations: any, prefix = ''): Record<string, string> {
  return Object.entries(translations).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return { ...acc, ...flattenTranslations(value, fullKey) };
    }
    return { ...acc, [fullKey]: String(value) };
  }, {} as Record<string, string>);
}

// Base translations (app, pwa, language)
const baseTranslations = {
  en: {
    // App
    'app.name': 'AI Trainer',
	'app.description': 'Welcome to AI Trainer, a personal trainer that uses AI to help you achieve your health goals.',
    
    // Navigation
    'nav.home': 'My Workouts',
    'nav.generateWorkout': 'New Workout',
    'nav.generateNutrition': 'New Nutrition Plan',
    'nav.about': 'About',
    
    // PWA
    'pwa.installTitle': 'Install App',
    'pwa.installDescription': 'Add this app to your home screen for quick access',
    'pwa.installButton': 'Install',
    'pwa.notNowButton': 'Not now',
    
    // Language
    'language.english': 'English',
    'language.portuguese': 'Portuguese',
    'language.select': 'Select Language',
  },
  pt: {
	// App
    'app.name': 'AI Trainer',
    'app.description': 'Bem vindo ao AI Trainer, um treinador personalizado que usa IA para ajudar você a alcançar seus objetivos para uma vida saudável.',    
    // Navigation
    'nav.home': 'Meus Treinos',
    'nav.generateWorkout': 'Novo Treino',
	'nav.generateNutrition': 'Novo Plano Alimentar',
    
    // PWA
    'pwa.installTitle': 'Instalar Aplicativo',
    'pwa.installDescription': 'Adicione este aplicativo à sua tela inicial para acesso rápido',
    'pwa.installButton': 'Instalar',
    'pwa.notNowButton': 'Agora não',
    'language.english': 'Inglês',
    'language.portuguese': 'Português',
    'language.select': 'Selecionar Idioma'
  }
};

// Combine all translations
const translations = {
  en: {
    ...baseTranslations.en,
    ...flattenTranslations(nutritionTranslations.en, 'nutrition'),
    ...flattenTranslations(workoutTranslations.en, 'workout'),
	...flattenTranslations(aboutTranslations.en, 'about')
  },
  pt: {
    ...baseTranslations.pt,
    ...flattenTranslations(nutritionTranslations.pt, 'nutrition'),
    ...flattenTranslations(workoutTranslations.pt, 'workout'),
	...flattenTranslations(aboutTranslations.pt, 'about')
  }
} as const;

// Base translation keys
type BaseTranslationKey = keyof typeof baseTranslations.en;

// Nutrition translation keys
type NutritionBaseKey = keyof typeof nutritionTranslations.en;
type NutritionNestedKey = 
  | `goals.${keyof typeof nutritionTranslations.en.goals}`
  | `cuisines.${keyof typeof nutritionTranslations.en.cuisines}`
  | `restrictions.${keyof typeof nutritionTranslations.en.restrictions}`;
type NutritionKey = NutritionBaseKey | NutritionNestedKey;

// Workout translation keys
type WorkoutBaseKey = keyof typeof workoutTranslations.en;
type WorkoutNestedKey =
  | `levels.${keyof typeof workoutTranslations.en.levels}`
  | `goals.${keyof typeof workoutTranslations.en.goals}`
  | `equipment.${keyof typeof workoutTranslations.en.equipment}`
  | `focusAreas.${keyof typeof workoutTranslations.en.focusAreas}`
  | `daysOfWeek.${keyof typeof workoutTranslations.en.daysOfWeek}`;
type WorkoutKey = WorkoutBaseKey | WorkoutNestedKey;

// About translation keys
type AboutBaseKey = keyof typeof aboutTranslations.en;
type AboutKey = AboutBaseKey;

export type TranslationKey =
  | BaseTranslationKey
  | `nutrition.${NutritionKey}`
  | `workout.${WorkoutKey}`
  | `about.${AboutKey}`;
export default translations as Record<Language, Record<TranslationKey, string>>;