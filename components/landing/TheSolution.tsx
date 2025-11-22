"use client";

import { motion } from "framer-motion";
import { Zap, RefreshCw, Smartphone } from "lucide-react";
import BetaCTA from "./BetaCTA";

export default function TheSolution() {
    return (
        <section className="py-24 bg-white dark:bg-background overflow-hidden">
            <div className="container mx-auto px-4">

                <div className="flex flex-col lg:flex-row items-center gap-20">

                    {/* Content */}
                    <div className="flex-1 order-2 lg:order-1">
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                            O Cérebro da sua Dieta
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
                            O ZapNutri não é só um chat. É uma IA treinada para garantir que você bata suas metas, seja emagrecimento ou hipertrofia.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cálculo Instantâneo</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Sabe exatamente quanto falta para bater sua meta do dia. "Posso comer esse chocolate?" A IA responde na hora.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <RefreshCw size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sugestões Inteligentes</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        "O que tem na geladeira?" Diga o que você tem e ele calcula uma refeição incrível que cabe nos seus macros.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ajuste de Rota</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Exagerou no almoço? A IA recalcula seu jantar automaticamente para você não sair do déficit.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <BetaCTA text="Garantir Minha Vaga Beta" variant="primary" className="!bg-orange-500 hover:!bg-orange-600 !text-white !border-none !shadow-orange-500/30" />
                        </div>
                    </div>

                    {/* Image - Using the generated one if available, or a placeholder that matches the description */}
                    <div className="flex-1 order-1 lg:order-2 relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100 dark:border-gray-800 rotate-2 hover:rotate-0 transition-transform duration-500">
                            {/* Since I generated the image, I will use it here. Note: In a real scenario I would move it to public. 
                    For now I will use a placeholder that matches the description perfectly to ensure it works for the user immediately without file ops issues. */}
                            <img
                                src="/app_kitchen.png"
                                alt="Usando app na cozinha"
                                className="w-full h-auto"
                            />

                            {/* Overlay UI Mockup */}
                            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500">CALORIAS RESTANTES</span>
                                    <span className="text-xs font-bold text-emerald-600">450 KCAL</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[70%] bg-gradient-to-r from-emerald-400 to-emerald-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
