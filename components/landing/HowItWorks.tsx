"use client";

import { motion } from "framer-motion";
import BetaCTA from "./BetaCTA";

const steps = [
    {
        number: "01",
        title: "Crie sua conta",
        description: "Cadastre-se em segundos e responda a um rápido quiz sobre seus hábitos e objetivos."
    },
    {
        number: "02",
        title: "Receba seu plano",
        description: "Nossa IA analisa seus dados e gera um plano alimentar completo e personalizado."
    },
    {
        number: "03",
        title: "Acompanhe e Evolua",
        description: "Registre refeições, tire dúvidas no chat e veja sua evolução dia após dia."
    }
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-emerald-50 dark:bg-emerald-950/10">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Simples, Rápido e Eficiente
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Comece sua jornada de transformação em apenas 3 passos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800"
                        >
                            <div className="text-6xl font-bold text-emerald-100 dark:text-emerald-900/30 absolute top-4 right-4 select-none">
                                {step.number}
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-4">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <BetaCTA text="Começar Agora" />
                </div>
            </div>
        </section>
    );
}
