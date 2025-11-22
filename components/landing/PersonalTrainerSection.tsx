"use client";

import { motion } from "framer-motion";
import { Dumbbell, TrendingUp, CalendarCheck } from "lucide-react";
import BetaCTA from "./BetaCTA";

export default function PersonalTrainerSection() {
    return (
        <section className="py-24 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16">

                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 w-full"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                            <img
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"
                                alt="Personal Trainer analisando treino no tablet"
                                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                            />

                            {/* Overlay Badge */}
                            <div className="absolute bottom-6 right-6 bg-slate-800/90 backdrop-blur shadow-lg p-4 rounded-xl border border-slate-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="font-bold text-white">Gestão de Treino AI</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 font-semibold text-sm border border-orange-500/30"
                        >
                            Para Personal Trainers
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-bold mb-6"
                        >
                            Tenha o controle total do treino dos seus alunos
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-300 mb-8 leading-relaxed"
                        >
                            Chega de planilhas perdidas no WhatsApp. Monitore a execução, saiba exatamente os dias que seu aluno treinou e acompanhe a evolução de cargas em tempo real.
                        </motion.p>

                        <div className="space-y-6 mb-10">
                            {[
                                { icon: CalendarCheck, title: "Frequência Real", text: "Saiba se ele realmente foi treinar hoje." },
                                { icon: TrendingUp, title: "Progressão de Cargas", text: "Gráficos automáticos de evolução de força." },
                                { icon: Dumbbell, title: "Ficha Interativa", text: "Seu aluno recebe o treino direto no WhatsApp." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-orange-400 shrink-0 border border-slate-700">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{item.title}</h3>
                                        <p className="text-slate-400 text-sm">{item.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <BetaCTA text="Quero testar com meus alunos" variant="outline" className="!text-white !border-white hover:!bg-white hover:!text-slate-900" />
                    </div>

                </div>
            </div>
        </section>
    );
}
