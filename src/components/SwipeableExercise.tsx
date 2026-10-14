'use client'
import { useRef, useState, ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const ACTIONS_WIDTH = 128;
const OPEN_THRESHOLD = 40;

interface Props {
    children: ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
    editLabel: string;
    deleteLabel: string;
}

export default function SwipeableExercise({ children, isOpen, onOpenChange, onEdit, onDelete, editLabel, deleteLabel }: Props) {
    const startX = useRef<number | null>(null);
    const moved = useRef(false);
    const [dragX, setDragX] = useState<number | null>(null);

    const baseOffset = isOpen ? -ACTIONS_WIDTH : 0;
    const offset = dragX === null ? baseOffset : Math.max(-ACTIONS_WIDTH, Math.min(0, baseOffset + dragX));

    const handlePointerDown = (e: React.PointerEvent) => {
        startX.current = e.clientX;
        moved.current = false;
        setDragX(0);
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (startX.current === null) return;
        const delta = e.clientX - startX.current;
        if (Math.abs(delta) > 4) moved.current = true;
        setDragX(delta);
    };

    const handlePointerEnd = () => {
        if (startX.current === null) return;
        const delta = dragX ?? 0;
        startX.current = null;
        setDragX(null);
        if (!isOpen && delta < -OPEN_THRESHOLD) onOpenChange(true);
        else if (isOpen && delta > OPEN_THRESHOLD) onOpenChange(false);
        else if (!moved.current && isOpen) onOpenChange(false);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-y-0 right-0 flex" style={{ width: ACTIONS_WIDTH }}>
                <button
                    type="button"
                    aria-label={editLabel}
                    title={editLabel}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center bg-terra-500 text-white hover:bg-terra-600 transition-colors"
                >
                    <Pencil className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    aria-label={deleteLabel}
                    title={deleteLabel}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={onDelete}
                    className="flex-1 flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
            <div
                data-testid="swipe-row"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{
                    transform: `translateX(${offset}px)`,
                    transition: dragX === null ? 'transform 0.2s ease' : 'none',
                    touchAction: 'pan-y',
                }}
                className="relative bg-white border border-warm-border shadow-xs rounded-2xl select-none cursor-grab"
            >
                {children}
            </div>
        </div>
    );
}
