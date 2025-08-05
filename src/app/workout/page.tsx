'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Language } from '@/lib/i18n/config';

interface WorkoutPreferences {
    fitnessLevel: string;
    goal: string;
    duration: string;
    daysPerWeek: number;
    availableEquipment: string[];
    specificFocusAreas: string[];
    injuries: string;
    additionalNotes: string;
}

interface WorkoutResponse {
	workout: {
		[day: string]: {
		name: string;
		description: string;
		image: string;
		}[];
	};
}

export default function Workout() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Load workout from localStorage on component mount
    useEffect(() => {
        const savedWorkout = localStorage.getItem('savedWorkout');
        if (savedWorkout) {
            setWorkout(JSON.parse(savedWorkout));
        }
    }, []);

    // Save workout to localStorage whenever it changes
    useEffect(() => {
        if (workout) {
            localStorage.setItem('savedWorkout', JSON.stringify(workout));
        }
    }, [workout]);

    const getWeekdayName = (day: string): string => {
        const weekdays = {
            'monday': language === 'pt' ? 'segunda-feira' : 'monday',
            'tuesday': language === 'pt' ? 'terca-feira' : 'tuesday',
            'wednesday': language === 'pt' ? 'quarta-feira' : 'wednesday',
            'thursday': language === 'pt' ? 'quinta-feira' : 'thursday',
            'friday': language === 'pt' ? 'sexta-feira' : 'friday',
            'segunda-feira': language === 'pt' ? 'segunda-feira' : 'monday',
            'terca-feira': language === 'pt' ? 'terca-feira' : 'tuesday',
            'quarta-feira': language === 'pt' ? 'quarta-feira' : 'wednesday',
            'quinta-feira': language === 'pt' ? 'quinta-feira' : 'thursday',
            'sexta-feira': language === 'pt' ? 'sexta-feira' : 'friday'
        };
        return weekdays[day.toLowerCase() as keyof typeof weekdays] || day;
    };

    const handleGenerateWorkout = async () => {
        // Redirect to the form page to collect preferences
        router.push('/generate-workout');
    };

    useEffect(() => {
        // Check for saved preferences and fetch workout if they exist
        const savedWorkout = localStorage.getItem('savedWorkout');
        const savedPreferences = localStorage.getItem('workoutPreferences');
        
        if (savedWorkout) {
            setWorkout(JSON.parse(savedWorkout));
        } else if (savedPreferences && !workout) {
            // If we have preferences but no workout, fetch one
            fetchWorkout(JSON.parse(savedPreferences));
        }
    }, []);

    const fetchWorkout = async (preferences: WorkoutPreferences) => {
        setLoading(true);
        try {
            const result = await axios.post<WorkoutResponse>('/api/workout', {
                language: language,
                fitnessLevel: preferences.fitnessLevel,
                goal: preferences.goal,
                duration: preferences.duration,
                daysPerWeek: preferences.daysPerWeek,
                availableEquipment: preferences.availableEquipment,
                specificFocusAreas: preferences.specificFocusAreas,
                injuries: preferences.injuries,
                additionalNotes: preferences.additionalNotes
            });
            setWorkout(result.data.workout);
        } catch (error) {
            console.error('Error calling API:', error);
        } finally {
            setLoading(false);
        }
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
                <div className="w-full mb-8">
                    <button 
                        onClick={handleGenerateWorkout} 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t('workout.generating') : t('workout.generateButton')}
                    </button>
                </div>
                
                {workout && (
                    <div className="w-full space-y-4">
                        {Object.entries(workout).map(([day, exercises], index) => {
                            const displayDay = getWeekdayName(day);
                            return (
                                <div key={day} className={`w-full bg-white rounded-lg shadow-md overflow-hidden ${index === 0 ? 'mt-5' : ''}`}>
                                    <button 
                                        onClick={() => toggleDay(day)}
                                        className="w-full px-6 py-4 text-left font-semibold text-lg flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors"
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
                                            {Array.isArray(exercises) && exercises.map((exercise: any, exIndex: number) => (
                                                <div key={exIndex} className="mb-6 last:mb-0">
                                                    <h3 className="text-xl font-semibold text-gray-800">{exercise.name}</h3>
                                                    <p className="text-gray-600 mt-2">{exercise.description}</p>
                                                    {exercise.image && (
                                                        <div className="mt-3">
                                                            <img 
                                                                src={exercise.image} 
                                                                alt={exercise.name}
                                                                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}