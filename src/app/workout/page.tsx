'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Language } from '@/lib/i18n/config';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_ABBR: Record<string, Record<string, string>> = {
    pt: { monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua', thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom' },
    en: { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' },
};

export default function Workout() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [workout, setWorkout] = useState<any>(null);
    const [hasCheckedWorkout, setHasCheckedWorkout] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const loadWorkout = useCallback(() => {
        try {
            const storedWorkout = localStorage.getItem('generatedWorkout');
            if (!storedWorkout) return false;
            
			try {
				const parsedWorkout = JSON.parse(atob(storedWorkout));
				if (!parsedWorkout) return false;
				setWorkout(parsedWorkout);
				return true;
			} catch (error) {
				try {
					const parsedWorkout = JSON.parse(storedWorkout);
					if (!parsedWorkout) return false;
					setWorkout(parsedWorkout);
					return true;
				} catch (error) {
					console.error('Error parsing workout data:', error);
					return false;
				}
			}
        } catch (error) {
            console.error('Error parsing workout data:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            const hasWorkout = loadWorkout();
            setHasCheckedWorkout(true);
            
            if (!hasWorkout && window.location.pathname === '/workout') {
                router.replace('/');
            }
        } else {
            setIsMounted(true);
        }
    }, [isMounted, loadWorkout, router]);

    useEffect(() => {
        if (workout) {
            const days = Object.entries(workout).filter(([_, exercises]) => Array.isArray(exercises));
            if (days.length > 0 && !selectedDay) {
                setSelectedDay(days[0][0]);
            }
        }
    }, [workout, selectedDay]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'generatedWorkout') {
                if (e.newValue === null) {
                    if (window.location.pathname === '/workout') {
                        router.replace('/');
                    }
                } else {
                    loadWorkout();
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadWorkout, router]);

    const getWeekdayName = (day: string): string => {
        const weekdays: Record<string, Record<string, string>> = {
            pt: {
                'monday': 'Segunda-feira', 'tuesday': 'Terça-feira', 'wednesday': 'Quarta-feira',
                'thursday': 'Quinta-feira', 'friday': 'Sexta-feira', 'saturday': 'Sábado', 'sunday': 'Domingo',
                'segunda-feira': 'Segunda-feira', 'terca-feira': 'Terça-feira', 'quarta-feira': 'Quarta-feira',
                'quinta-feira': 'Quinta-feira', 'sexta-feira': 'Sexta-feira', 'sabado': 'Sábado', 'domingo': 'Domingo'
            },
            en: {
                'monday': 'Monday', 'tuesday': 'Tuesday', 'wednesday': 'Wednesday',
                'thursday': 'Thursday', 'friday': 'Friday', 'saturday': 'Saturday', 'sunday': 'Sunday',
            }
        };
        const langMap = weekdays[language] || weekdays['en'];
        return langMap[day.toLowerCase()] || day;
    };

    const getDayAbbr = (day: string): string => {
        const abbrs = DAY_ABBR[language] || DAY_ABBR['en'];
        return abbrs[day.toLowerCase()] || day.slice(0, 3);
    };

    if (!isMounted || !hasCheckedWorkout) {
        return (
            <div className="min-h-screen bg-warm-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terra-500"></div>
            </div>
        );
    }

    if (!workout) {
        return (
            <div className="min-h-screen bg-warm-bg flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-bark-800 mb-4">
                    {t('workout.noWorkout')}
                </h2>
                <p className="text-bark-500 mb-6">
                    {t('workout.generatePrompt')}
                </p>
            </div>
        );
    }

    const workoutDays = Object.entries(workout).filter(([_, exercises]) => Array.isArray(exercises));
    const currentDayData = workoutDays.find(([day]) => day === selectedDay);

    return (
        <div className="min-h-screen bg-warm-bg">
            {/* Floating Action Button */}
            <Link 
                href="/generate-workout"
                className="fixed bottom-24 right-4 bg-terra-500 text-white p-3.5 rounded-full shadow-lg hover:bg-terra-600 transition-colors z-40 flex items-center justify-center"
                title={t('nav.generateWorkout')}
            >
                <Pencil className="h-5 w-5" />
            </Link>

            <div className="max-w-lg mx-auto px-4 pt-4">
                {/* Day Selector Pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {workoutDays.map(([day]) => {
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
                        <h2 className="text-xl font-bold text-bark-800 mb-4 capitalize">
                            {getWeekdayName(currentDayData[0])}
                        </h2>
                        <div className="space-y-3">
                            {Array.isArray(currentDayData[1]) && (currentDayData[1] as any[]).map((exercise: any, exIndex: number) => (
                                exercise && exercise.name ? (
                                    <div key={`${currentDayData[0]}-${exIndex}`} className="bg-white rounded-2xl p-4 border border-warm-border shadow-sm">
                                        <h3 className="text-lg font-bold text-bark-800">{exercise.name}</h3>
                                        {exercise.description && (
                                            <p className="text-bark-500 text-sm mt-1">{exercise.description}</p>
                                        )}
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
