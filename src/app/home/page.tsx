'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { GoInfo } from "react-icons/go";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved workout in localStorage
    const generatedWorkout = localStorage.getItem('generatedWorkout');
    if (generatedWorkout) {
      try {
        const parsedWorkout = JSON.parse(atob(generatedWorkout));
        if (parsedWorkout && Object.keys(parsedWorkout).length > 0) {
          router.push('/workout');
          return;
        }
      } catch (error) {
		try {
			const parsedWorkout = JSON.parse(generatedWorkout);
			if (parsedWorkout && Object.keys(parsedWorkout).length > 0) {
			  router.push('/workout');
			}
		} catch (error) {
			console.error('Error parsing saved workout:', error);
		}
      }
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terra-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-warm-border text-center">
        <h1 className="text-3xl font-bold text-bark-800 mb-6">
          {t('app.name')}
        </h1>
        <p className="text-bark-500 mb-8">
          {t('app.description')}
        </p>
		<div className="flex gap-3">
			<button
			onClick={() => router.push('/generate-workout')}
			className="flex-2 w-full bg-terra-500 hover:bg-terra-600 text-white font-medium py-3 px-6 rounded-2xl transition-colors shadow-md"
			>
			{t('workout.getStarted')}
			</button>
			<button
			onClick={() => router.push('/about')}
			className="flex-1 w-full bg-bark-100 hover:bg-bark-200 text-bark-700 font-medium py-3 px-6 rounded-2xl transition-colors"
			>
				<GoInfo title={t('about.title')} />
			</button>
		</div>
      </div>
    </div>
  );
}
