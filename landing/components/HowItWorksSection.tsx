import { motion } from "framer-motion";
import { Card } from "@landing/components/ui/card";
import { FileText, Send, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Receba seu plano",
    description: "Seu nutricionista ou personal trainer configura seu plano alimentar e de treino personalizado no sistema.",
  },
  {
    number: "02",
    icon: Send,
    title: "Envie áudio ou texto",
    description: "Registre suas refeições e treinos de forma natural pelo WhatsApp: 'Almocei frango com arroz' ou 'Fiz agachamento 3x12 com 80kg'.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Receba feedback imediato",
    description: "A IA analisa, registra calorias, acompanha progressão de treino e ajusta seu plano. Seu profissional vê tudo em tempo real.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Como <span className="text-primary">Funciona</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Três passos simples para transformar sua rotina de alimentação e treino.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-y-1/2 z-0" />
              )}
              
              <Card className="p-8 h-full backdrop-blur-sm bg-card/80 border-card-border hover-elevate rounded-2xl relative z-10" data-testid={`card-step-${index}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-6xl font-bold text-primary/20">{step.number}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mt-2">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Simples assim. Sem complicação.</p>
        </motion.div>
      </div>
    </section>
  );
}



