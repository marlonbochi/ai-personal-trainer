'use client'
import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/TranslationContext';

interface Props {
    title: string;
    subtitle?: string;
    label: string;
    placeholder: string;
    confirmLabel: string;
    loadingLabel: string;
    errorMessage: string;
    isLoading: boolean;
    hasError: boolean;
    onConfirm: (text: string) => void;
    onClose: () => void;
}

export default function ExerciseRequestSheet({
    title, subtitle, label, placeholder, confirmLabel, loadingLabel, errorMessage,
    isLoading, hasError, onConfirm, onClose,
}: Props) {
    const { t } = useTranslation();
    const [text, setText] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={isLoading ? undefined : onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="exercise-request-title"
                className="w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 id="exercise-request-title" className="text-lg font-bold text-bark-800">{title}</h3>
                        {subtitle && <p className="text-sm text-bark-500">{subtitle}</p>}
                    </div>
                    <button type="button" onClick={onClose} disabled={isLoading} aria-label={t('workout.cancelButton')} className="p-1 text-bark-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <label className="block text-sm font-semibold text-bark-700 mb-1" htmlFor="exercise-request-text">
                    {label}
                </label>
                <textarea
                    id="exercise-request-text"
                    value={text}
                    maxLength={500}
                    rows={3}
                    disabled={isLoading}
                    onChange={e => setText(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border-2 border-warm-border p-3 text-sm text-bark-800 focus:border-terra-500 outline-hidden"
                />

                {hasError && <p className="text-sm text-terra-700 mt-2">{errorMessage}</p>}

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => onConfirm(text)}
                    className="mt-4 w-full bg-terra-500 text-white font-semibold py-3 rounded-xl hover:bg-terra-600 transition-colors disabled:opacity-60"
                >
                    {isLoading ? loadingLabel : confirmLabel}
                </button>
            </div>
        </div>
    );
}
