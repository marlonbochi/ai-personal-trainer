'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Language } from '@/lib/i18n/config';
import Modal from '@/components/ui/Modal';

export default function Workout() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [workout, setWorkout] = useState<any>(null);
    const [hasCheckedWorkout, setHasCheckedWorkout] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
	const [isTouched, setIsTouched] = useState(false);
	const [isLongTouched, setIsLongTouched] = useState(false);
	const [exerciseModal, setExerciseModal] = useState<any>(null);

    // Function to load workout from localStorage
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

    // Handle the initial load and redirect logic
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

    // Handle storage events from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'generatedWorkout') {
                if (e.newValue === null) {
                    // If workout was cleared and we're on the workout page, redirect to home
                    if (window.location.pathname === '/workout') {
                        router.replace('/');
                    }
                } else {
                    // Reload the workout if it was updated
                    loadWorkout();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadWorkout, router]);

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

    if (!isMounted || !hasCheckedWorkout) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

	const handleTouchStart = (exercise: any) => {
		setIsTouched(true);
		setTimeout(() => {
			console.log(isTouched);
			if (isTouched) {
				setIsLongTouched(true);
			}
		}, 3000);
		setExerciseModal(exercise);
	};

	const handleTouchEnd = () => {
		setIsTouched(false);
		setIsLongTouched(false);
		setExerciseModal(null);
	};

	const deleteExercise = () => {
		setWorkout((prevWorkout: any) => {
			const newWorkout = { ...prevWorkout };
			newWorkout[exerciseModal.day] = newWorkout[exerciseModal.day].filter(
				(ex: any) => ex.id !== exerciseModal.id
			);
			return newWorkout;
		});
		setExerciseModal(null);
	};

	const replaceExercise = () => {
		setExerciseModal(null);
	};

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
                                                    <div 
														key={`${day}-${exIndex}`} 
														className={`mb-6 select-none last:mb-0 ${isTouched ? 'active:scale-95 active:shadow-lg transition-transform duration-150' : ''}`} 
														onTouchStart={() => handleTouchStart(exercise)} onTouchEnd={handleTouchEnd}
													>
                                                    {isTouched && isLongTouched && (
														<Modal 
															open={isLongTouched} 
															onClose={() => setIsLongTouched(false)}
															title={exerciseModal.name}
														>
															{exerciseModal.description && (
																<p className="text-gray-600 mt-2">{exerciseModal.description}</p>
															)}
															<div className="flex justify-end mt-4 space-x-2">
																<button 
																	className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors" 
																	onClick={deleteExercise}
																>
																	{t('workout.deleteExercise')}
																</button>
																<button 
																	className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
																	onClick={replaceExercise}
																>
																	{t('workout.replaceExercise')}
																</button>
															</div>
														</Modal>
                                                    )}
                                                        <h3 className="text-xl font-semibold text-gray-800">{exercise.name}</h3>
                                                        {exercise.description && (
                                                            <p className="text-gray-600 mt-2 user-select-none">{exercise.description}</p>
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