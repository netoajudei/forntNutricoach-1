import { motion } from "framer-motion";
import { Card } from "@landing/components/ui/card";
import { Smartphone, Clock, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Smartphone,
    title: "Apps Complexos Demais",
    description: "Cadastros intermináveis, interfaces confusas e funcionalidades que ninguém usa. Você quer perder peso, não aprender um software.",
  },
  {
    icon: Clock,
    title: "Falta de Tempo para Registrar",
    description: "Abrir app, fotografar, categorizar, adicionar porções... Enquanto isso, sua comida esfria e sua motivação também.",
  },
  {
    icon: TrendingDown,
    title: "Planos Estáticos que Não se Adaptam",
    description: "A vida acontece. Você comeu fora do planejado ou perdeu o treino e agora? PDFs não conversam, planilhas não entendem contexto.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Por que <span className="text-destructive">73%</span> das pessoas desistem?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Identificamos os principais motivos pelos quais dietas e planos de treino são abandonados.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 h-full backdrop-blur-sm bg-card/80 border-card-border hover-elevate rounded-2xl" data-testid={`card-problem-${index}`}>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



