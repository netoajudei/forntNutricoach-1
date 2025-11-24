"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OnboardingSuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
    console.log('OnboardingSuccessModal render, isOpen:', isOpen);
    if (!isOpen) return null;
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 rounded-full p-4">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                    Cadastro Concluído! 🎉
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 mb-6 leading-relaxed">
                    Suas informações foram registradas com sucesso!
                    <br />
                    <br />
                    Em breve você receberá o <span className="font-semibold text-green-600">código de ativação</span> pelo WhatsApp assim que os planos forem montados.
                </p>

                {/* OK Button */}
                <button
                    onClick={onClose}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    OK
                </button>
            </div>
        </div>
    );
};
