'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen,
    title,
    description,
    confirmLabel = '确认',
    cancelLabel = '取消',
    onConfirm,
    onCancel,
    variant = 'danger'
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-backdrop px-4" onClick={onCancel}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                    >
                        {/* Status Accent Bar */}
                        <div className={`h-2 w-full ${variant === 'danger' ? 'bg-rose-500' : 'bg-amber-500'}`} />

                        <div className="p-8 pt-10 text-center space-y-6">
                            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-inner ${variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                                <ExclamationTriangleIcon className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 font-heading tracking-tight">{title}</h3>
                                <p className="text-slate-500 font-bold leading-relaxed">{description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button
                                    variant="ghost"
                                    className="py-4 font-black uppercase text-xs tracking-widest bg-slate-50 hover:bg-slate-100"
                                    onClick={onCancel}
                                >
                                    {cancelLabel}
                                </Button>
                                <Button
                                    variant={variant === 'danger' ? 'primary' : 'secondary'}
                                    className={`py-4 font-black uppercase text-xs tracking-widest shadow-xl ${variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100 text-white' : ''}`}
                                    onClick={onConfirm}
                                >
                                    {confirmLabel}
                                </Button>
                            </div>
                        </div>

                        <button
                            onClick={onCancel}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
