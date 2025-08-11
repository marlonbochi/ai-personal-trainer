'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Pencil } from 'lucide-react';
import WeekPlan from '@/models/nutrition';
import Link from 'next/link';

type DietGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';

export default function NutritionPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [plan, setPlan] = useState<WeekPlan | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [openDay, setOpenDay] = useState<string | null>(null);
	const [nutritionPreferences, setNutritionPreferences] = useState({
        dietGoal: 'maintenance' as DietGoal,
        caloriesPerDay: 2000,
        budgetPerWeek: 100,
        mealsPerDay: 3,
        dietaryRestrictions: [] as string[],
        allergies: [] as string[],
        preferredCuisines: [] as string[],
        additionalNotes: '',
        age: 30,
        gender: 'male'
    });

    useEffect(() => {
        setIsMounted(true);
        const storedPlan = localStorage.getItem('generatedNutrition');
        if (storedPlan) {
            setPlan(JSON.parse(atob(storedPlan)));
            const firstDay = Object.keys(JSON.parse(atob(storedPlan)).days)[0];
            if (firstDay) setOpenDay(firstDay);
        }

		const nutritionPreferences = localStorage.getItem('nutritionPreferences');
		if (nutritionPreferences) {
			setNutritionPreferences(JSON.parse(nutritionPreferences));
		}
		
    }, []);

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {t('nutrition.noPlanTitle')}
                    </h2>
                    <button
                        onClick={() => router.push('/generate-nutrition')}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        {t('nutrition.createPlanButton')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            
			{plan && (
                <Link 
					href="/generate-nutrition"
					className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40 flex items-center justify-center"
					title={t('nav.generateNutrition')}
				>
					<Pencil className="h-6 w-6" />
				</Link>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('nutrition.mealPlan')}
                    </h1>
                    <div className="flex items-center text-sm text-gray-500">
                        <span>{t('nutrition.dietGoal')}: {t(`nutrition.goals.${nutritionPreferences.dietGoal}`)}</span>
                        <span className="mx-2">•</span>
                        <span>{nutritionPreferences.mealsPerDay} {t('nutrition.mealsPerDay')}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(plan.days).map(([day, dayPlan]) => (
                        <div key={day} className="bg-white rounded-lg shadow overflow-hidden">
                            <button
                                onClick={() => setOpenDay(openDay === day ? null : day)}
                                className="w-full px-4 py-3 flex justify-between items-center text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                            >
                                <span>{day}</span>
                                <span>{openDay === day ? '−' : '+'}</span>
                            </button>
                            
                            {openDay === day && (
                                <div className="p-4 space-y-4">
                                    {Object.entries(dayPlan).map(([mealName, meal], index) => {
										return (
											<div key={index} className="border-b pb-4 last:border-0 last:pb-0">
												<h2 className="font-medium text-gray-900">{mealName}</h2>
												
												{Array.isArray(meal) ? (
													Object.entries(meal).map(([subMealName, subMeal], subIndex) => (
														<div key={subIndex} className="mt-2">
															<h4 className="text-sm font-semibold text-gray-800">{subMeal.name}</h4>
															{subMeal.ingredients.map((ingredient, ingredientIndex) => (
																<div key={ingredientIndex} className="mt-2">
																	<h6 className="text-sm font-semibold text-gray-800">- {ingredient}</h6>
																</div>
															))}
															<br/>
															<p className="text-sm text-gray-600 mt-1"><b>{t('nutrition.howToMake')}</b>: {subMeal.instructions}</p>
															<div className="flex justify-between mt-2 text-xs text-gray-500">
															<span>{subMeal.nutrition.calories} kcal</span>
															<span>P: {subMeal.nutrition.protein}g</span>
															<span>C: {subMeal.nutrition.carbs}g</span>
															<span>F: {subMeal.nutrition.fat}g</span>
														</div>
													</div>
												))) : (
													<>
														{meal.ingredients.map((ingredient, ingredientIndex) => (
															<div key={ingredientIndex} className="mt-2">
																<h6 className="text-sm font-semibold text-gray-800">- {ingredient}</h6>
															</div>
														))}	
														<br/>
														<p className="text-sm text-gray-600 mt-1"><b>{t('nutrition.howToMake')}</b>: {meal.instructions}</p>
														<div className="flex justify-between mt-2 text-xs text-gray-500">
															<span>{meal.nutrition.calories} kcal</span>
															<span>P: {meal.nutrition.protein}g</span>
															<span>C: {meal.nutrition.carbs}g</span>
															<span>F: {meal.nutrition.fat}g</span>
														</div>
													</>
												)}
											</div>
										);
									})}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
