'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Language } from '@/lib/i18n/config';
import Modal from '@/components/ui/Modal';
import { fetchWithValidation } from '@/lib/api';

export default function Workout() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [workout, setWorkout] = useState<any>(null);
    const [hasCheckedWorkout, setHasCheckedWorkout] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
	const [isTouched, setIsTouched] = useState(false);
	const isTouchedRef = useRef(false);
	const isLongTouched = useRef(false);
	const [exerciseModal, setExerciseModal] = useState<any>(null);
	const [isReplacing, setIsReplacing] = useState(false);
	const timer = useRef<NodeJS.Timeout | null>(null);

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

	const handleTouchStart = (exercise: any, day: string) => {
		setIsTouched(true);
		isTouchedRef.current = true;
		timer.current = setTimeout(() => {
			if (isTouchedRef.current) {
				isLongTouched.current = true;
				setExerciseModal({ ...exercise, day });
			}
		}, 2000);
	};

	const handleTouchEnd = () => {
		setIsTouched(false);
		isTouchedRef.current = false;
		if (timer.current) {
			clearTimeout(timer.current);
			timer.current = null;
		}
		// Don't close modal if it was opened by long press
		if (!isLongTouched.current) {
			setExerciseModal(null);
		}
	};

	const saveWorkoutToStorage = (updatedWorkout: any) => {
		try {
			localStorage.setItem('generatedWorkout', btoa(JSON.stringify(updatedWorkout)));
		} catch (error) {
			console.error('Error saving workout to storage:', error);
		}
	};

	const closeModal = () => {
		isLongTouched.current = false;
		setExerciseModal(null);
		setIsReplacing(false);
	};

	const deleteExercise = () => {
		setWorkout((prevWorkout: any) => {
			const newWorkout = { ...prevWorkout };
			const dayKey = exerciseModal.day;
			newWorkout[dayKey] = newWorkout[dayKey].filter(
				(_: any, index: number) => {
					const exercises = prevWorkout[dayKey];
					return exercises[index].name !== exerciseModal.name;
				}
			);
			saveWorkoutToStorage(newWorkout);
			return newWorkout;
		});
		closeModal();
	};

	const replaceExercise = async () => {
		if (!exerciseModal) return;

		setIsReplacing(true);

		try {
			const newExercise = await fetchWithValidation<{ name: string; description: string }>('/api/workout/edit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: exerciseModal.name,
					description: exerciseModal.description || '',
					language,
				}),
			});

			setWorkout((prevWorkout: any) => {
				const newWorkout = { ...prevWorkout };
				const dayKey = exerciseModal.day;
				newWorkout[dayKey] = newWorkout[dayKey].map((ex: any) =>
					ex.name === exerciseModal.name
						? { name: newExercise.name, description: newExercise.description }
						: ex
				);
				saveWorkoutToStorage(newWorkout);
				return newWorkout;
			});

			closeModal();
		} catch (error) {
			console.error('Error replacing exercise:', error);
			setIsReplacing(false);
		}
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
														onTouchStart={() => handleTouchStart(exercise, day)} onTouchEnd={handleTouchEnd}
														onMouseDown={() => handleTouchStart(exercise, day)} onMouseUp={handleTouchEnd}
													>
                                                    {exerciseModal && exerciseModal.name === exercise.name && (
														<Modal 
															open={true} 
															onClose={closeModal}
															title={exerciseModal.name}
														>
															{exerciseModal.description && (
																<p className="text-gray-600 mt-2">{exerciseModal.description}</p>
															)}
															{isReplacing ? (
																<div className="flex justify-center mt-4 py-2">
																	<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
																</div>
															) : (
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
															)}
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
