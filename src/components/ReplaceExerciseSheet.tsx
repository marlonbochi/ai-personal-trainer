'use client'
import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';

interface Props {
    exerciseName: string;
    isLoading: boolean;
    hasError: boolean;
    onConfirm: (reason: string) => void;
    onClose: () => void;
}

export default function ReplaceExerciseSheet({ exerciseName, isLoading, hasError, onConfirm, onClose }: Props) {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={isLoading ? undefined : onClose}>
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-bark-800">{t('workout.replaceExerciseTitle')}</h3>
                        <p className="text-sm text-bark-500">{exerciseName}</p>
                    </div>
                    <button type="button" onClick={onClose} disabled={isLoading} aria-label={t('workout.cancelButton')} className="p-1 text-bark-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <label className="block text-sm font-semibold text-bark-700 mb-1" htmlFor="replace-reason">
                    {t('workout.replaceReasonLabel')}
                </label>
                <textarea
                    id="replace-reason"
                    value={reason}
                    maxLength={500}
                    rows={3}
                    disabled={isLoading}
                    onChange={e => setReason(e.target.value)}
                    placeholder={t('workout.replaceReasonPlaceholder')}
                    className="w-full rounded-xl border-2 border-warm-border p-3 text-sm text-bark-800 focus:border-terra-500 outline-none"
                />

                {hasError && <p className="text-sm text-terra-700 mt-2">{t('workout.replaceError')}</p>}

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => onConfirm(reason)}
                    className="mt-4 w-full bg-terra-500 text-white font-semibold py-3 rounded-xl hover:bg-terra-600 transition-colors disabled:opacity-60"
                >
                    {isLoading ? t('workout.replacing') : t('workout.replaceConfirm')}
                </button>
            </div>
        </div>
    );
}
