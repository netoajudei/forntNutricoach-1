"use client";

import { motion } from "framer-motion";
import BetaCTA from "./BetaCTA";
import { MessageCircle, CheckCircle } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-background pt-32">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm"
                        >
                            <MessageCircle size={16} />
                            <span className="text-emerald-900">Sua Nutricionista no WhatsApp</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-orange-500">
                                A dieta perfeita é aquela que cabe na sua rotina
                            </span> <br />
                            <span className="text-emerald-800 text-4xl lg:text-6xl">(e no seu WhatsApp).</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                        >
                            Pare de baixar apps inúteis. Nossa IA monitora sua alimentação, substitui ingredientes e garante seu resultado conversando com você onde você já está.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start"
                        >
                            <BetaCTA variant="primary" text="Quero ser Beta Tester" className="!bg-emerald-500 hover:!bg-emerald-600 !text-white !border-none !shadow-emerald-500/30" />
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>Sem instalação extra</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Image Content - WhatsApp Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex-1 relative w-full max-w-md mx-auto"
                    >
                        <div className="relative z-10 bg-white dark:bg-gray-900 rounded-[3rem] border-8 border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden aspect-[9/19]">
                            {/* Chat Header */}
                            <div className="bg-[#075E54] p-4 flex items-center gap-3 text-white">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="font-bold">ZN</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">ZapNutri AI</p>
                                    <p className="text-xs opacity-80">Online agora</p>
                                </div>
                            </div>

                            {/* Chat Body */}
                            <div className="p-4 space-y-4 bg-[#E5DDD5] dark:bg-gray-800 h-full">
                                <div className="flex justify-end">
                                    <div className="bg-[#DCF8C6] dark:bg-emerald-700 text-gray-800 dark:text-white p-3 rounded-lg rounded-tr-none max-w-[80%] shadow-sm text-sm">
                                        Comi uma fatia de pizza a mais no almoço 🍕. E agora?
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm text-sm">
                                        Sem problemas! 😉 Para compensar e manter o déficit, vamos ajustar seu jantar.
                                        <br /><br />
                                        <strong>Sugestão:</strong> Salada de frango grelhado (150g) com folhas verdes. Topa?
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-[#DCF8C6] dark:bg-emerald-700 text-gray-800 dark:text-white p-3 rounded-lg rounded-tr-none max-w-[80%] shadow-sm text-sm">
                                        Perfeito, topo sim! 👍
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute top-1/4 -right-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                    🔥
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Déficit Calórico</p>
                                    <p className="font-bold text-gray-900 dark:text-white">Na meta!</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
