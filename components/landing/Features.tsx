"use client";

import { motion } from "framer-motion";
import { Utensils, MessageSquare, TrendingUp, ShieldCheck, Zap, Heart } from "lucide-react";

const features = [
    {
        icon: Utensils,
        title: "Planos Personalizados",
        description: "Dietas adaptadas ao seu gosto, rotina e objetivos, geradas instantaneamente por IA."
    },
    {
        icon: MessageSquare,
        title: "Chat Inteligente",
        description: "Tire dúvidas sobre alimentos, substituições e receitas a qualquer hora do dia."
    },
    {
        icon: TrendingUp,
        title: "Acompanhamento Real",
        description: "Registre suas refeições e veja seu progresso com gráficos detalhados e insights."
    },
    {
        icon: Zap,
        title: "Ajustes Rápidos",
        description: "Mudou de objetivo? A IA recalcula sua rota nutricional em segundos."
    },
    {
        icon: ShieldCheck,
        title: "Base Científica",
        description: "Todas as recomendações são baseadas em diretrizes nutricionais comprovadas."
    },
    {
        icon: Heart,
        title: "Foco em Saúde",
        description: "Mais do que estética, priorizamos sua saúde e bem-estar a longo prazo."
    }
];

export default function Features() {
    return (
        <section className="py-24 bg-white dark:bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Tudo o que você precisa para <br />
                        <span className="text-emerald-600">alcançar seus objetivos</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        O Nutricoach combina tecnologia de ponta com ciência nutricional para entregar a melhor experiência possível.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
