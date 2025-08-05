'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

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