"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'info' | 'success';
}

export default function AlertDialog({ isOpen, onClose, title, message, type = 'error' }: AlertDialogProps) {
    if (!isOpen) return null;

    const colors = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            icon: 'text-red-500',
            button: 'bg-red-500 hover:bg-red-600',
            title: 'text-red-900'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            icon: 'text-blue-500',
            button: 'bg-blue-500 hover:bg-blue-600',
            title: 'text-blue-900'
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-100',
            icon: 'text-green-500',
            button: 'bg-green-500 hover:bg-green-600',
            title: 'text-green-900'
        }
    };

    const theme = colors[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden z-10"
                    >
                        <div className={`p-6 ${theme.bg}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 bg-white rounded-xl shadow-sm ${theme.icon}`}>
                                    <AlertCircle size={24} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-black/5 rounded-full transition-colors text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <h3 className={`text-lg font-bold mb-2 ${theme.title}`}>
                                {title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {message}
                            </p>

                            <button
                                onClick={onClose}
                                className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-lg shadow-black/5 transition-all active:scale-[0.98] ${theme.button}`}
                            >
                                Entendi
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
