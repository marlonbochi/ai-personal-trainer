'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Pencil } from 'lucide-react';
import WeekPlan from '@/models/nutrition';
import Link from 'next/link';

type DietGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';

const DAY_ABBR: Record<string, Record<string, string>> = {
    pt: { monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua', thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom' },
    en: { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' },
};

export default function NutritionPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [plan, setPlan] = useState<WeekPlan | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
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
            const parsed = JSON.parse(atob(storedPlan));
            setPlan(parsed);
            const firstDay = Object.keys(parsed.days)[0];
            if (firstDay) setSelectedDay(firstDay);
        }

		const nutritionPreferences = localStorage.getItem('nutritionPreferences');
		if (nutritionPreferences) {
			setNutritionPreferences(JSON.parse(nutritionPreferences));
		}
		
    }, []);

    const getDayAbbr = (day: string): string => {
        const abbrs = DAY_ABBR[language] || DAY_ABBR['en'];
        return abbrs[day.toLowerCase()] || day.slice(0, 3);
    };

    const getWeekdayName = (day: string): string => {
        const weekdays: Record<string, Record<string, string>> = {
            pt: {
                'monday': 'Segunda-feira', 'tuesday': 'Terça-feira', 'wednesday': 'Quarta-feira',
                'thursday': 'Quinta-feira', 'friday': 'Sexta-feira', 'saturday': 'Sábado', 'sunday': 'Domingo',
            },
            en: {
                'monday': 'Monday', 'tuesday': 'Tuesday', 'wednesday': 'Wednesday',
                'thursday': 'Thursday', 'friday': 'Friday', 'saturday': 'Saturday', 'sunday': 'Sunday',
            }
        };
        const langMap = weekdays[language] || weekdays['en'];
        return langMap[day.toLowerCase()] || day;
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-warm-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terra-500"></div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-warm-bg flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                    <h2 className="text-xl font-semibold text-bark-800 mb-4">
                        {t('nutrition.noPlanTitle')}
                    </h2>
                    <button
                        onClick={() => router.push('/generate-nutrition')}
                        className="w-full py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-terra-500 hover:bg-terra-600 transition-colors"
                    >
                        {t('nutrition.createPlanButton')}
                    </button>
                </div>
            </div>
        );
    }

    const dayEntries = Object.entries(plan.days);
    const currentDayData = dayEntries.find(([day]) => day === selectedDay);

    return (
        <div className="min-h-screen bg-warm-bg">
			{plan && (
                <Link 
					href="/generate-nutrition"
					className="fixed bottom-24 right-4 bg-terra-500 text-white p-3.5 rounded-full shadow-lg hover:bg-terra-600 transition-colors z-40 flex items-center justify-center"
					title={t('nav.generateNutrition')}
				>
					<Pencil className="h-5 w-5" />
				</Link>
            )}

            <div className="max-w-lg mx-auto px-4 pt-4">
                {/* Day Selector Pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {dayEntries.map(([day]) => {
                        const isSelected = selectedDay === day;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                                    isSelected
                                        ? 'bg-terra-500 text-white border-terra-500'
                                        : 'bg-white text-bark-600 border-warm-border hover:border-terra-300'
                                }`}
                            >
                                {getDayAbbr(day)}
                            </button>
                        );
                    })}
                </div>

                {/* Day Content */}
                {currentDayData && (
                    <div>
                        {/* Day Header Card */}
                        <div className="bg-terra-500 rounded-t-2xl px-5 py-3">
                            <h2 className="text-lg font-bold text-white capitalize">
                                {getWeekdayName(currentDayData[0])}
                            </h2>
                        </div>

                        {/* Meals */}
                        <div className="bg-white rounded-b-2xl border border-warm-border border-t-0 divide-y divide-warm-border">
                            {Object.entries(currentDayData[1]).map(([mealName, meal], index) => (
                                <div key={index} className="p-4">
                                    <h3 className="font-bold text-bark-800 text-lg mb-2">{mealName}</h3>
                                    
                                    {Array.isArray(meal) ? (
                                        (meal as any[]).map((subMeal: any, subIndex: number) => (
                                            <div key={subIndex} className="mb-3 last:mb-0">
                                                <h4 className="text-sm font-semibold text-bark-700">{subMeal.name}</h4>
                                                {subMeal.ingredients.map((ingredient: string, ingredientIndex: number) => (
                                                    <div key={ingredientIndex} className="flex items-start gap-2 mt-1">
                                                        <span className="text-olive-500 mt-0.5">✓</span>
                                                        <span className="text-sm text-bark-600">{ingredient}</span>
                                                    </div>
                                                ))}
                                                <p className="text-sm text-terra-600 font-medium mt-2">{t('nutrition.howToMake')}</p>
                                                <p className="text-sm text-bark-500 mt-0.5">{subMeal.instructions}</p>
                                                <div className="flex gap-4 mt-2 text-xs text-bark-400 border-t border-warm-border pt-2">
                                                    <span className="text-olive-600 font-medium">{subMeal.nutrition.calories} kcal</span>
                                                    <span>P: {subMeal.nutrition.protein}g</span>
                                                    <span>C: {subMeal.nutrition.carbs}g</span>
                                                    <span>F: {subMeal.nutrition.fat}g</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {(meal as any).ingredients.map((ingredient: string, ingredientIndex: number) => (
                                                <div key={ingredientIndex} className="flex items-start gap-2 mt-1">
                                                    <span className="text-olive-500 mt-0.5">✓</span>
                                                    <span className="text-sm text-bark-600">{ingredient}</span>
                                                </div>
                                            ))}
                                            <p className="text-sm text-terra-600 font-medium mt-3">{t('nutrition.howToMake')}</p>
                                            <p className="text-sm text-bark-500 mt-0.5">{(meal as any).instructions}</p>
                                            <div className="flex gap-4 mt-3 text-xs text-bark-400 border-t border-warm-border pt-2">
                                                <span className="text-olive-600 font-medium">{(meal as any).nutrition.calories} kcal</span>
                                                <span>P: {(meal as any).nutrition.protein}g</span>
                                                <span>C: {(meal as any).nutrition.carbs}g</span>
                                                <span>F: {(meal as any).nutrition.fat}g</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
