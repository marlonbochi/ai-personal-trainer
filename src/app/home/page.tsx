'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved workout in localStorage
    const generatedWorkout = localStorage.getItem('generatedWorkout');
    if (generatedWorkout) {
      try {
        const parsedWorkout = JSON.parse(generatedWorkout);
        if (parsedWorkout && Object.keys(parsedWorkout).length > 0) {
          // Redirect to workout page if we have a valid saved workout
          router.push('/workout');
          return;
        }
      } catch (error) {
        console.error('Error parsing saved workout:', error);
      }
    }
    setIsLoading(false);
  }, [router]);

  // Show loading state while checking for saved workout
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t('workout.title')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('workout.tagline')}
        </p>
        <button
          onClick={() => router.push('/generate-workout')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {t('workout.getStarted')}
        </button>
      </div>
    </div>
  );
}