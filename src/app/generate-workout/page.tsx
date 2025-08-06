'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';

type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
type WorkoutGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength';
type WorkoutDuration = '15_min' | '30_min' | '45_min' | '60_min';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export default function GenerateWorkoutPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    
    const [formData, setFormData] = useState({
        fitnessLevel: 'intermediate' as FitnessLevel,
        goal: 'muscle_gain' as WorkoutGoal,
        duration: '30_min' as WorkoutDuration,
        daysPerWeek: 3,
        selectedDays: ['monday', 'wednesday', 'friday'] as DayOfWeek[],
        availableEquipment: [] as string[],
        specificFocusAreas: [] as string[],
        injuries: '',
        additionalNotes: ''
    });

    // Load saved form data from localStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem('workoutPreferences');
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
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        
        if (name === 'selectedDays') {
            setFormData(prev => ({
                ...prev,
                selectedDays: checked
                    ? [...prev.selectedDays, value as DayOfWeek]
                    : prev.selectedDays.filter(day => day !== value),
                daysPerWeek: checked 
                    ? prev.daysPerWeek + 1 
                    : Math.max(1, prev.daysPerWeek - 1) // Ensure at least 1 day is selected
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: checked 
                    ? [...prev[name as keyof typeof prev] as string[], value]
                    : (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Save form data to localStorage
            localStorage.setItem('workoutPreferences', JSON.stringify(formData));
            
            // Call the workout API to generate the workout plan
            const response = await fetch('/api/workout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    daysPerWeek: formData.selectedDays.length, // Use the count of selected days
                    selectedDays: formData.selectedDays,
                    language, // Add current language to the request
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate workout plan');
            }

            const workoutData = await response.json();
            
            // Save the generated workout data to localStorage
            localStorage.setItem('generatedWorkout', JSON.stringify(workoutData.workout));
            
            // Navigate to workout page to display the generated plan
            router.push('/workout');
        } catch (error) {
            console.error('Error generating workout plan:', error);
            alert(error instanceof Error ? error.message : 'Failed to generate workout plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fitnessLevels = [
        { value: 'beginner', label: t('workout.levels.beginner') },
        { value: 'intermediate', label: t('workout.levels.intermediate') },
        { value: 'advanced', label: t('workout.levels.advanced') }
    ];

    const goals = [
        { value: 'weight_loss', label: t('workout.goals.weightLoss') },
        { value: 'muscle_gain', label: t('workout.goals.muscleGain') },
        { value: 'endurance', label: t('workout.goals.endurance') },
        { value: 'strength', label: t('workout.goals.strength') }
    ];

    const durations = [
        { value: '15_min', label: '15 min' },
        { value: '30_min', label: '30 min' },
        { value: '45_min', label: '45 min' },
        { value: '60_min', label: '60 min' }
    ];

    const workoutTypeOptions = [
        { value: 'gym', label: t('workout.equipment.gym') },
        { value: 'home', label: t('workout.equipment.homeWorkout') }
    ];

    const focusAreas = [
        { value: 'chest', label: t('workout.focusAreas.chest') },
        { value: 'back', label: t('workout.focusAreas.back') },
        { value: 'legs', label: t('workout.focusAreas.legs') },
        { value: 'shoulders', label: t('workout.focusAreas.shoulders') },
        { value: 'arms', label: t('workout.focusAreas.arms') },
        { value: 'core', label: t('workout.focusAreas.core') },
        { value: 'cardio', label: t('workout.focusAreas.cardio') }
    ];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    {t('workout.customizePlan')}
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fitness Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.fitnessLevel')}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {fitnessLevels.map(level => (
                                <label key={level.value} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="fitnessLevel"
                                        value={level.value}
                                        checked={formData.fitnessLevel === level.value}
                                        onChange={handleChange}
                                        className="h-4 w-4"
                                    />
                                    <span className="ml-2">{level.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Workout Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.workoutGoal')}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {goals.map(goal => (
                                <label key={goal.value} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="goal"
                                        value={goal.value}
                                        checked={formData.goal === goal.value}
                                        onChange={handleChange}
                                        className="h-4 w-4"
                                    />
                                    <span className="ml-2">{goal.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Workout Duration */}
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.workoutDuration')}
                        </label>
                        <select
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base sm:text-sm"
                        >
                            {durations.map(duration => (
                                <option key={duration.value} value={duration.value}>
                                    {duration.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Days of the Week */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.daysPerWeek')} ({formData.selectedDays.length} {t('workout.days').toLowerCase()})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'monday', label: t('workout.daysOfWeek.monday') },
                                { value: 'tuesday', label: t('workout.daysOfWeek.tuesday') },
                                { value: 'wednesday', label: t('workout.daysOfWeek.wednesday') },
                                { value: 'thursday', label: t('workout.daysOfWeek.thursday') },
                                { value: 'friday', label: t('workout.daysOfWeek.friday') },
                                { value: 'saturday', label: t('workout.daysOfWeek.saturday') },
                                { value: 'sunday', label: t('workout.daysOfWeek.sunday') }
                            ].map(day => (
                                <label key={day.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="selectedDays"
                                        value={day.value}
                                        checked={formData.selectedDays.includes(day.value as DayOfWeek)}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2">{day.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Workout Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.availableEquipment')}
                        </label>
                        <div className="space-y-2">
                            {workoutTypeOptions.map(option => (
                                <label key={option.value} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="workoutType"
                                        value={option.value}
                                        checked={formData.availableEquipment[0] === option.value}
                                        onChange={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                availableEquipment: [option.value]
                                            }));
                                        }}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Focus Areas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.specificFocusAreas')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {focusAreas.map(area => (
                                <label key={area.value} className="flex itsems-center">
                                    <input
                                        type="checkbox"
                                        name="specificFocusAreas"
                                        value={area.value}
                                        checked={formData.specificFocusAreas.includes(area.value)}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4"
                                    />
                                    <span className="ml-2">{area.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Injuries */}
                    <div>
                        <label htmlFor="injuries" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.injuries')}
                        </label>
                        <input
                            type="text"
                            id="injuries"
                            name="injuries"
                            value={formData.injuries}
                            onChange={handleChange}
                            placeholder={t('workout.injuriesPlaceholder')}
                            className="mt-1 block w-full py-2 px-3 sm:text-sm"
                        />
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('workout.additionalNotes')}
                        </label>
                        <textarea
                            id="additionalNotes"
                            name="additionalNotes"
                            rows={3}
                            value={formData.additionalNotes}
                            onChange={handleChange}
                            placeholder={t('workout.additionalNotesPlaceholder')}
                            className="mt-1 block w-full py-2 px-3 sm:text-sm"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="pt-4 flex space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/workout')}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {t('workout.cancelButton')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                isSubmitting
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {isSubmitting ? t('workout.generating') : t('workout.generatePlan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
