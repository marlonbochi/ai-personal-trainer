import enNutrition from './en/nutrition';
import ptNutrition from './pt/nutrition';
import { workoutTranslations as enWorkout } from './en/workout';
import { workoutTranslations as ptWorkout } from './pt/workout';

export const nutritionTranslations = {
  en: enNutrition,
  pt: ptNutrition,
};

export const workoutTranslations = {
  en: enWorkout,
  pt: ptWorkout,
};

export type NutritionTranslationKey = keyof typeof enNutrition | 
  `goals.${keyof typeof enNutrition.goals}` |
  `cuisines.${keyof typeof enNutrition.cuisines}` |
  `restrictions.${keyof typeof enNutrition.restrictions}`;

export type WorkoutTranslationKey = keyof typeof enWorkout |
  `levels.${keyof typeof enWorkout.levels}` |
  `goals.${keyof typeof enWorkout.goals}` |
  `equipment.${keyof typeof enWorkout.equipment}` |
  `focusAreas.${keyof typeof enWorkout.focusAreas}` |
  `daysOfWeek.${keyof typeof enWorkout.daysOfWeek}`;