'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Language } from '@/lib/i18n/config';

export default function Workout() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Function to load workout from localStorage
    const loadWorkout = () => {
        // First try to get from generatedWorkout, then fall back to savedWorkout
        const generatedWorkout = localStorage.getItem('generatedWorkout');
        const savedWorkout = localStorage.getItem('savedWorkout');
        
        const workoutToUse = generatedWorkout || savedWorkout;
        
        if (workoutToUse) {
            try {
                const parsedWorkout = JSON.parse(workoutToUse);
                setWorkout(parsedWorkout);
                // Ensure it's saved to both keys for consistency
                localStorage.setItem('savedWorkout', workoutToUse);
                if (generatedWorkout) {
                    localStorage.setItem('generatedWorkout', workoutToUse);
                }
                return true;
            } catch (error) {
                console.error('Error parsing workout data:', error);
            }
        }
        return false;
    };

    // Track if component is mounted to prevent hydration issues
    const [isMounted, setIsMounted] = useState(false);

    // Load workout on component mount
    useEffect(() => {
        setIsMounted(true);
        const hasWorkout = loadWorkout();
        if (!hasWorkout) {
            router.push('/generate-workout');
        }
    }, [router]);

    // Listen for storage events to detect changes from other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'generatedWorkout' || e.key === 'savedWorkout') {
                loadWorkout();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const getWeekdayName = (day: string): string => {
        const weekdays = {
            'monday': language === 'pt' ? 'segunda-feira' : 'monday',
            'tuesday': language === 'pt' ? 'terca-feira' : 'tuesday',
            'wednesday': language === 'pt' ? 'quarta-feira' : 'wednesday',
            'thursday': language === 'pt' ? 'quinta-feira' : 'thursday',
            'friday': language === 'pt' ? 'sexta-feira' : 'friday',
            'saturday': language === 'pt' ? 'sábado' : 'saturday',
            'sunday': language === 'pt' ? 'domingo' : 'sunday',
            'segunda-feira': language === 'pt' ? 'segunda-feira' : 'monday',
            'terca-feira': language === 'pt' ? 'terca-feira' : 'tuesday',
            'quarta-feira': language === 'pt' ? 'quarta-feira' : 'wednesday',
            'quinta-feira': language === 'pt' ? 'quinta-feira' : 'thursday',
            'sexta-feira': language === 'pt' ? 'sexta-feira' : 'friday',
            'sabado': language === 'pt' ? 'sábado' : 'saturday',
            'domingo': language === 'pt' ? 'domingo' : 'sunday'
        };
        return weekdays[day.toLowerCase() as keyof typeof weekdays] || day;
    };

    const handleGenerateWorkout = () => {
        router.push('/generate-workout');
    };

    const [openDay, setOpenDay] = useState<string | null>(null);

    const toggleDay = (day: string) => {
        setOpenDay(openDay === day ? null : day);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center">
            <div className="w-full max-w-[1000px] px-4">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {t('workout.title')}
                </h1>	
                
                {!isMounted ? (
                    <div className="w-full text-center py-10">
                        <p className="text-gray-600">{t('workout.generating')}</p>
                    </div>
                ) : workout ? (
                    <div className="w-full space-y-4">
                        {Object.entries(workout).map(([day, exercises], index) => {
                            const displayDay = getWeekdayName(day);
                            return (
                                <div key={day} className={`w-full bg-white rounded-lg shadow-md overflow-hidden ${index === 0 ? 'mt-5' : ''}`}>
                                    <button 
                                        onClick={() => toggleDay(day)}
                                        className="w-full px-6 py-4 text-left font-semibold text-lg flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors"
                                        aria-expanded={openDay === day}
                                    >
                                        <span className="capitalize">{displayDay}</span>
                                        {openDay === day ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </button>
                                    
                                    {openDay === day && (
                                        <div className="p-6">
                                            {Array.isArray(exercises) ? (
                                                exercises.map((exercise: any, exIndex: number) => (
                                                    exercise && exercise.name ? (
                                                        <div key={`${day}-${exIndex}`} className="mb-6 last:mb-0">
                                                            <h3 className="text-xl font-semibold text-gray-800">{exercise.name}</h3>
                                                            {exercise.description && (
                                                                <p className="text-gray-600 mt-2">{exercise.description}</p>
                                                            )}
                                                        </div>
                                                    ) : null
                                                ))
                                            ) : typeof exercises === 'string' ? (
                                                <p className="text-gray-600 mt-2">{exercises}</p>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : !loading && (
                    <div className="text-center py-10">
                        <p className="text-gray-600">
                            {language === 'pt' 
                                ? 'Nenhum treino encontrado. Gere um novo treino para começar.'
                                : 'No workout found. Generate a new workout to get started.'}
                        </p>
                    </div>
                )}
				
                <div className="w-full mt-8 mb-8">
                    <button 
                        onClick={handleGenerateWorkout} 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t('workout.generating') : t('workout.generateButton')}
                    </button>
                </div>
            </div>
        </div>
    );
}