'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';

type Meal = {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

type DayPlan = {
    day: string;
    meals: Meal[];
};

type NutritionPlan = {
    days: DayPlan[];
    weeklyCalories: number;
    weeklyBudget: number;
    mealsPerDay: number;
    dietGoal: string;
};

export default function NutritionPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [plan, setPlan] = useState<NutritionPlan | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [openDay, setOpenDay] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const storedPlan = localStorage.getItem('generatedNutrition');
        if (storedPlan) {
            setPlan(JSON.parse(storedPlan));
            const firstDay = JSON.parse(storedPlan).days[0]?.day;
            if (firstDay) setOpenDay(firstDay);
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
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('nutrition.mealPlan')}
                    </h1>
                    <div className="flex items-center text-sm text-gray-500">
                        <span>{t('nutrition.dietGoal')}: {plan.dietGoal}</span>
                        <span className="mx-2">•</span>
                        <span>{plan.mealsPerDay} {t('nutrition.mealsPerDay')}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {plan.days.map((dayPlan) => (
                        <div key={dayPlan.day} className="bg-white rounded-lg shadow overflow-hidden">
                            <button
                                onClick={() => setOpenDay(openDay === dayPlan.day ? null : dayPlan.day)}
                                className="w-full px-4 py-3 flex justify-between items-center text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                            >
                                <span>{dayPlan.day}</span>
                                <span>{openDay === dayPlan.day ? '−' : '+'}</span>
                            </button>
                            
                            {openDay === dayPlan.day && (
                                <div className="p-4 space-y-4">
                                    {dayPlan.meals.map((meal, index) => (
                                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                                            <h3 className="font-medium text-gray-900">{meal.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>{meal.calories} kcal</span>
                                                <span>P: {meal.protein}g</span>
                                                <span>C: {meal.carbs}g</span>
                                                <span>F: {meal.fat}g</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
