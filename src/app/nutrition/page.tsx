'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Pencil } from 'lucide-react';
import WeekPlan from '@/models/nutrition';
import Link from 'next/link';
import { mealId, weekdayId } from '@/lib/nutritionLabels';
import { parseStoredPlan } from '@/lib/storedPlan';

type Macros = { calories: number; protein: number; carbs: number; fat: number };

function MacroLine({ nutrition, className }: { nutrition: Macros; className: string }) {
    const { t } = useTranslation();
    return (
        <div data-testid="macros" className={`flex gap-4 text-xs text-bark-400 border-t border-warm-border pt-2 ${className}`}>
            <span className="text-olive-600 font-medium">{nutrition.calories} kcal</span>
            {(['protein', 'carbs', 'fat'] as const).map(macro => (
                <span key={macro}>
                    <abbr title={t(`nutrition.macros.${macro}`)} className="no-underline">{t(`nutrition.macroAbbr.${macro}`)}</abbr>: {nutrition[macro]}g
                </span>
            ))}
        </div>
    );
}

export default function NutritionPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [plan, setPlan] = useState<WeekPlan | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const parsed = parseStoredPlan(localStorage.getItem('generatedNutrition'));
        // Anything without a days object is treated as no plan.
        if (parsed && parsed.days && typeof parsed.days === 'object') {
            setPlan(parsed as unknown as WeekPlan);
            const firstDay = Object.keys(parsed.days)[0];
            if (firstDay) setSelectedDay(firstDay);
        }
    }, []);

    // Keys are whatever the model returned ('Segunda-feira', 'Monday', 'Breakfast', 'almoço'...);
    // known ones are shown in the UI language, unknown ones as written.
    const getDayAbbr = (day: string): string => {
        const id = weekdayId(day);
        return id ? t(`nutrition.dayAbbr.${id}`) : day.slice(0, 3);
    };

    const getWeekdayName = (day: string): string => {
        const id = weekdayId(day);
        return id ? t(`workout.daysOfWeek.${id}`) : day;
    };

    const getMealName = (meal: string): string => {
        const id = mealId(meal);
        return id ? t(`nutrition.mealNames.${id}`) : meal;
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
                            <h2 className="text-lg font-bold text-white">
                                {getWeekdayName(currentDayData[0])}
                            </h2>
                        </div>

                        {/* Meals */}
                        <div className="bg-white rounded-b-2xl border border-warm-border border-t-0 divide-y divide-warm-border">
                            {Object.entries(currentDayData[1]).map(([mealName, meal], index) => (
                                <div key={index} className="p-4">
                                    <h3 className="font-bold text-bark-800 text-lg mb-2">{getMealName(mealName)}</h3>
                                    
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
                                                <MacroLine nutrition={subMeal.nutrition} className="mt-2" />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {(meal as any).name && (
                                                <h4 className="text-sm font-semibold text-bark-700">{(meal as any).name}</h4>
                                            )}
                                            {(meal as any).ingredients.map((ingredient: string, ingredientIndex: number) => (
                                                <div key={ingredientIndex} className="flex items-start gap-2 mt-1">
                                                    <span className="text-olive-500 mt-0.5">✓</span>
                                                    <span className="text-sm text-bark-600">{ingredient}</span>
                                                </div>
                                            ))}
                                            <p className="text-sm text-terra-600 font-medium mt-3">{t('nutrition.howToMake')}</p>
                                            <p className="text-sm text-bark-500 mt-0.5">{(meal as any).instructions}</p>
                                            <MacroLine nutrition={(meal as any).nutrition} className="mt-3" />
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
