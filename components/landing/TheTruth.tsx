"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export default function TheTruth() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                        A Verdade Nua e Crua
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Pare de acreditar em balela. A única forma científica de emagrecer é o <span className="font-bold text-orange-600">Déficit Calórico</span>. Tudo fora disso é mentira.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">

                    {/* The Problem Side */}
                    <div className="relative h-[500px] group">
                        <div className="absolute inset-0 bg-gray-900/60 group-hover:bg-gray-900/50 transition-colors z-10" />
                        <img
                            src="/confused_man.jpg"
                            alt="Confusão com dieta"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="relative z-20 h-full flex flex-col justify-center p-12 text-white">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 backdrop-blur flex items-center justify-center mb-6">
                                <X size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">O Velho Jeito</h3>
                            <p className="text-lg text-gray-200 mb-6">
                                Dietas restritivas, contar calorias manualmente, ansiedade e o efeito sanfona eterno. Você tenta, sofre e desiste.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-red-200"><X size={16} /> Apps complexos</li>
                                <li className="flex items-center gap-3 text-red-200"><X size={16} /> Comida sem graça</li>
                                <li className="flex items-center gap-3 text-red-200"><X size={16} /> Frustração garantida</li>
                            </ul>
                        </div>
                    </div>

                    {/* The Solution Side */}
                    <div className="relative h-[500px] group">
                        <div className="absolute inset-0 bg-emerald-900/40 group-hover:bg-emerald-900/30 transition-colors z-10" />
                        <img
                            src="/fit_woman.jpg"
                            alt="Controle e felicidade"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="relative z-20 h-full flex flex-col justify-center p-12 text-white">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 backdrop-blur flex items-center justify-center mb-6">
                                <Check size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">O Jeito ZapNutri</h3>
                            <p className="text-lg text-gray-100 mb-6">
                                Você come o que gosta, a IA calcula tudo e te mantém no déficit. Sem sofrimento, apenas ciência aplicada à sua rotina.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-emerald-200"><Check size={16} /> Tudo no WhatsApp</li>
                                <li className="flex items-center gap-3 text-emerald-200"><Check size={16} /> Ajustes em tempo real</li>
                                <li className="flex items-center gap-3 text-emerald-200"><Check size={16} /> Resultados constantes</li>
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
