'use client'
import { useTranslation } from '@/lib/i18n/TranslationContext';

interface Props {
    exerciseName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDeleteDialog({ exerciseName, onConfirm, onCancel }: Props) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-title"
                className="w-full max-w-sm bg-white rounded-2xl p-5"
                onClick={e => e.stopPropagation()}
            >
                <h3 id="confirm-delete-title" className="text-lg font-bold text-bark-800">{t('workout.deleteConfirmTitle')}</h3>
                <p className="text-sm text-bark-500 mt-2">
                    <span className="font-semibold text-bark-700">{exerciseName}</span> - {t('workout.deleteConfirmMessage')}
                </p>
                <div className="flex gap-3 mt-5">
                    <button
                        type="button"
                        autoFocus
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border-2 border-warm-border text-bark-700 font-semibold hover:border-terra-300 transition-colors"
                    >
                        {t('workout.cancelButton')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                    >
                        {t('workout.deleteConfirmAction')}
                    </button>
                </div>
            </div>
        </div>
    );
}
