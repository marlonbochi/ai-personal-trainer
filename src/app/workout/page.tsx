'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
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
            setLoading(false);
        } else {
            setLoading(false);
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

    // Removed handleGenerateWorkout as we're using a direct Link now

    const [openDay, setOpenDay] = useState<string | null>(null);

    const toggleDay = (day: string) => {
        setOpenDay(openDay === day ? null : day);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!workout) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {t('workout.noWorkout')}
                </h2>
                <p className="text-gray-600 mb-6">
                    {t('workout.generatePrompt')}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center relative">
            {/* Floating Action Button */}
            <Link 
                href="/generate-workout"
                className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40 flex items-center justify-center"
                title={t('nav.generateWorkout')}
            >
                <Pencil className="h-6 w-6" />
            </Link>
            
            <div className="w-full max-w-[1000px] px-4">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {t('workout.title')}
                </h1>	
                
                <div className="w-full space-y-4">
                    {Object.entries(workout)
                        // Filter out days that don't have an array of exercises
                        .filter(([_, exercises]) => Array.isArray(exercises))
                        .map(([day, exercises], index) => {
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
            </div>
        </div>
    );
}