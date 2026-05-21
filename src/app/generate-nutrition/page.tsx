'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TranslationKey } from '@/lib/i18n/translations';
import { fetchWithValidation } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/TranslationContext';

type DietGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';

export default function GenerateNutritionPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    
    const [formData, setFormData] = useState({
        dietGoal: 'maintenance' as DietGoal,
        caloriesPerDay: 2000,
        budgetPerWeek: 100,
        mealsPerDay: 3,
        dietaryRestrictions: [] as string[],
        allergies: [] as string[],
        preferredCuisines: [] as string[],
        additionalNotes: '',
        age: 30,
        gender: 'male' as 'male' | 'female'
    });

	useEffect(() => {
		const savedData = localStorage.getItem('nutritionPreferences');
		if (savedData) {
			try {
				const parsedData = JSON.parse(savedData);
				setFormData(prev => ({
					...prev,
					...parsedData
				}));
			} catch (error) {
				console.error('Error parsing saved preferences:', error);
			}
		}
	}, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        
        if (name === 'caloriesPerDay' || name === 'budgetPerWeek') {
            if (value === '' || /^\d+$/.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value === '' ? '' : parseInt(value, 10)
                }));
            }
        } else if (name === 'age' || name === 'mealsPerDay') {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value, 10)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
			localStorage.setItem('nutritionPreferences', JSON.stringify(formData));

            const data = await fetchWithValidation('/api/nutrition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({language, ...formData}),
            });

            if (data) {
                localStorage.setItem('generatedNutrition', btoa(JSON.stringify(data)));
                router.push('/nutrition');
            }
        } catch (error) {
            console.error('Error generating nutrition plan:', error);
            alert('Failed to generate nutrition plan. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-bg py-6 relative">
            {isSubmitting && (
                <div className="absolute inset-0 bg-warm-bg/70 flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terra-500 mx-auto"></div>
                        <p className="mt-4 text-bark-600">{t('nutrition.generating')}...</p>
                    </div>
                </div>
            )}
            
            <div className="max-w-lg mx-auto px-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-warm-border p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-bark-700 mb-1">
                                    {t('nutrition.age')}
                                </label>
                                <select
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="mt-1 block w-full rounded-xl border-warm-border shadow-sm focus:border-terra-500 focus:ring-terra-500 sm:text-sm disabled:opacity-75 disabled:bg-bark-50"
                                >
                                    {Array.from({ length: 85 }, (_, i) => 15 + i).map(age => (
                                        <option key={age} value={age}>
                                            {age} {t('nutrition.yearsOld')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-bark-700 mb-1">
                                    {t('nutrition.gender')}
                                </label>
                                <div className="mt-1 flex gap-4 directionFlexColumn">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="h-4 w-4"
                                        />
                                        <span className="ml-2 text-bark-600">{t('nutrition.genderMale')}</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="h-4 w-4"
                                        />
                                        <span className="ml-2 text-bark-600">{t('nutrition.genderFemale')}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Diet Goal */}
                    <div className="bg-white rounded-2xl border border-warm-border p-4">
                        <label className="block text-sm font-medium text-bark-700 mb-2">
                            {t('nutrition.dietGoal')}
                        </label>
                        <select
                            name="dietGoal"
                            value={formData.dietGoal}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base sm:text-sm rounded-xl border-warm-border disabled:opacity-75 disabled:bg-bark-50"
                        >
                            <option value="weight_loss">{t('nutrition.goals.weight_loss')}</option>
                            <option value="muscle_gain">{t('nutrition.goals.muscle_gain')}</option>
                            <option value="maintenance">{t('nutrition.goals.maintenance')}</option>
                            <option value="endurance">{t('nutrition.goals.endurance')}</option>
                        </select>
                    </div>

                    {/* Calories and Budget */}
                    <div className="bg-white rounded-2xl border border-warm-border p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="caloriesPerDay" className="block text-sm font-medium text-bark-700 mb-1">
                                    {t('nutrition.caloriesPerDay')}
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    id="caloriesPerDay"
                                    name="caloriesPerDay"
                                    value={formData.caloriesPerDay}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="mt-1 block w-full rounded-xl border-warm-border shadow-sm focus:border-terra-500 focus:ring-terra-500 sm:text-sm disabled:opacity-75 disabled:bg-bark-50"
                                />
                            </div>
                            <div>
                                <label htmlFor="budgetPerWeek" className="block text-sm font-medium text-bark-700 mb-1">
                                    {t('nutrition.budgetPerWeek')} ({t('nutrition.currency')})
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    id="budgetPerWeek"
                                    name="budgetPerWeek"
                                    value={formData.budgetPerWeek}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="mt-1 block w-full rounded-xl border-warm-border shadow-sm focus:border-terra-500 focus:ring-terra-500 sm:text-sm disabled:opacity-75 disabled:bg-bark-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meals per Day */}
                    <div className="bg-white rounded-2xl border border-warm-border p-4">
                        <label htmlFor="mealsPerDay" className="block text-sm font-medium text-bark-700 mb-1">
                            {t('nutrition.mealsPerDay')}
                        </label>
                        <select
                            id="mealsPerDay"
                            name="mealsPerDay"
                            value={formData.mealsPerDay}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base sm:text-sm rounded-xl border-warm-border disabled:opacity-75 disabled:bg-bark-50"
                        >
                            {[3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>{num} {t('nutrition.meals')}</option>
                            ))}
                        </select>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-white rounded-2xl border border-warm-border p-4">
                        <label htmlFor="additionalNotes" className="block text-sm font-medium text-bark-700 mb-2">
                            {t('nutrition.additionalNotes')}
                        </label>
                        <textarea
                            id="additionalNotes"
                            name="additionalNotes"
                            rows={3}
                            value={formData.additionalNotes}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder={t('nutrition.additionalNotesPlaceholder')}
                            className="mt-1 block w-full py-2 px-3 sm:text-sm rounded-xl border-warm-border disabled:opacity-75 disabled:bg-bark-50"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => !isSubmitting && router.push('/nutrition')}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 border-2 border-warm-border-dark rounded-2xl text-sm font-medium text-bark-600 bg-white hover:bg-bark-50 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('nutrition.cancelButton')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-2xl shadow-md text-sm font-medium text-white bg-terra-500 hover:bg-terra-600 disabled:bg-terra-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? t('nutrition.generating') : t('nutrition.generatePlan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
