'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import SwipeableExercise from '@/components/SwipeableExercise';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import ExerciseRequestSheet from '@/components/ExerciseRequestSheet';
import { parseStoredWorkout, serializeWorkout, removeExercise, replaceExercise, addExercise, canAddExercise, WorkoutPlan } from '@/lib/workoutEdit';
import { sanitizeContext } from '@/lib/addExercise';

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
    const [openRow, setOpenRow] = useState<number | null>(null);
    const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [isReplacing, setIsReplacing] = useState(false);
    const [replaceFailed, setReplaceFailed] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [addFailed, setAddFailed] = useState(false);

    const loadWorkout = useCallback(() => {
        const parsed = parseStoredWorkout(localStorage.getItem('generatedWorkout'));
        if (!parsed) return false;
        setWorkout(parsed);
        return true;
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

    const persistWorkout = (plan: WorkoutPlan) => {
        setWorkout(plan);
        try {
            localStorage.setItem('generatedWorkout', serializeWorkout(plan));
        } catch (error) {
            console.error('Error saving workout data:', error);
        }
    };

    const handleDelete = (day: string, index: number) => {
        persistWorkout(removeExercise(workout, day, index));
        setDeletingIndex(null);
        setOpenRow(null);
    };

    const handleReplace = async (day: string, index: number, reason: string) => {
        const exercises = workout[day] as any[];
        setIsReplacing(true);
        setReplaceFailed(false);
        try {
            const response = await fetch('/api/replace-exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language,
                    exercise: exercises[index],
                    otherExercises: exercises.filter((_, i) => i !== index).map(e => e?.name).filter(Boolean),
                    reason,
                }),
            });
            if (!response.ok) throw new Error(`Request failed: ${response.status}`);
            const replacement = await response.json();
            persistWorkout(replaceExercise(workout, day, index, replacement));
            setReplacingIndex(null);
            setOpenRow(null);
        } catch (error) {
            console.error('Error replacing exercise:', error);
            setReplaceFailed(true);
        } finally {
            setIsReplacing(false);
        }
    };

    const loadFormContext = () => {
        try {
            const saved = localStorage.getItem('workoutPreferences');
            return saved ? sanitizeContext(JSON.parse(saved)) : {};
        } catch {
            return {};
        }
    };

    const handleAdd = async (day: string, description: string) => {
        const exercises = workout[day] as any[];
        setIsAdding(true);
        setAddFailed(false);
        try {
            const response = await fetch('/api/add-exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language,
                    day: getWeekdayName(day),
                    otherExercises: exercises.map(e => e?.name).filter(Boolean),
                    description,
                    context: loadFormContext(),
                }),
            });
            if (!response.ok) throw new Error(`Request failed: ${response.status}`);
            const exercise = await response.json();
            persistWorkout(addExercise(workout, day, exercise));
            setIsAddOpen(false);
        } catch (error) {
            console.error('Error adding exercise:', error);
            setAddFailed(true);
        } finally {
            setIsAdding(false);
        }
    };

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
                                onClick={() => { setSelectedDay(day); setOpenRow(null); setDeletingIndex(null); setIsAddOpen(false); }}
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
                        <p className="text-xs text-bark-400 mb-3">{t('workout.swipeHint')}</p>
                        <div className="space-y-3">
                            {Array.isArray(currentDayData[1]) && (currentDayData[1] as any[]).length === 0 && (
                                <p className="text-bark-500 text-sm">{t('workout.emptyDay')}</p>
                            )}
                            {Array.isArray(currentDayData[1]) && (currentDayData[1] as any[]).map((exercise: any, exIndex: number) => (
                                exercise && exercise.name ? (
                                    <SwipeableExercise
                                        key={`${currentDayData[0]}-${exIndex}-${exercise.name}`}
                                        isOpen={openRow === exIndex}
                                        onOpenChange={open => setOpenRow(open ? exIndex : null)}
                                        onEdit={() => { setReplaceFailed(false); setReplacingIndex(exIndex); }}
                                        onDelete={() => setDeletingIndex(exIndex)}
                                        editLabel={t('workout.editExercise')}
                                        deleteLabel={t('workout.removeExercise')}
                                    >
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-bark-800">{exercise.name}</h3>
                                            {exercise.description && (
                                                <p className="text-bark-500 text-sm mt-1">{exercise.description}</p>
                                            )}
                                        </div>
                                    </SwipeableExercise>
                                ) : null
                            ))}
                            {canAddExercise(workout, currentDayData[0]) && (
                                <button
                                    type="button"
                                    onClick={() => { setAddFailed(false); setIsAddOpen(true); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-terra-300 text-terra-600 font-semibold hover:bg-terra-50 transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    {t('workout.addExercise')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {currentDayData && deletingIndex !== null && (currentDayData[1] as any[])[deletingIndex] && (
                <ConfirmDeleteDialog
                    exerciseName={(currentDayData[1] as any[])[deletingIndex].name}
                    onConfirm={() => handleDelete(currentDayData[0], deletingIndex)}
                    onCancel={() => setDeletingIndex(null)}
                />
            )}

            {currentDayData && replacingIndex !== null && (currentDayData[1] as any[])[replacingIndex] && (
                <ExerciseRequestSheet
                    title={t('workout.replaceExerciseTitle')}
                    subtitle={(currentDayData[1] as any[])[replacingIndex].name}
                    label={t('workout.replaceReasonLabel')}
                    placeholder={t('workout.replaceReasonPlaceholder')}
                    confirmLabel={t('workout.replaceConfirm')}
                    loadingLabel={t('workout.replacing')}
                    errorMessage={t('workout.replaceError')}
                    isLoading={isReplacing}
                    hasError={replaceFailed}
                    onConfirm={reason => handleReplace(currentDayData[0], replacingIndex, reason)}
                    onClose={() => setReplacingIndex(null)}
                />
            )}

            {currentDayData && isAddOpen && (
                <ExerciseRequestSheet
                    title={t('workout.addExerciseTitle')}
                    subtitle={getWeekdayName(currentDayData[0])}
                    label={t('workout.addDescriptionLabel')}
                    placeholder={t('workout.addDescriptionPlaceholder')}
                    confirmLabel={t('workout.addConfirm')}
                    loadingLabel={t('workout.adding')}
                    errorMessage={t('workout.addError')}
                    isLoading={isAdding}
                    hasError={addFailed}
                    onConfirm={description => handleAdd(currentDayData[0], description)}
                    onClose={() => setIsAddOpen(false)}
                />
            )}
        </div>
    );
}
