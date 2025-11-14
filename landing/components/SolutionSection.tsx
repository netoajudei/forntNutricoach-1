import { motion } from "framer-motion";
import { Card } from "@landing/components/ui/card";
import { MessageSquare, Brain, Users, Zap } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "É Só Mandar um Áudio ou Texto",
    description: "Nada de formulários. Você fala naturalmente: 'Comi um pão de queijo' ou 'Fiz 3x10 de supino com 60kg' e pronto. A IA entende e registra.",
    size: "large",
  },
  {
    icon: Brain,
    title: "Inteligência Artificial Generativa",
    description: "Tecnologia de ponta que entende contexto, linguagem natural e se adapta ao seu dia a dia, tanto na alimentação quanto no treino.",
    size: "small",
  },
  {
    icon: Zap,
    title: "Integração Nativa com WhatsApp",
    description: "Sem instalar app. Sem criar conta. Sem complicação. Tudo no app que você já usa todos os dias.",
    size: "small",
  },
  {
    icon: Users,
    title: "Seu Nutri e Personal Conectados",
    description: "Acabou o 'diário fantasma'. Profissionais veem dados reais de adesão à dieta e frequência de treino em tempo real, com progressão de carga e muito mais.",
    size: "large",
  },
];

export default function SolutionSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            A Solução que Você <span className="text-primary">Estava Esperando</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simplicidade encontra tecnologia de ponta. Tudo integrado ao WhatsApp.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:row-span-2"
            >
              <Card className="p-8 h-full backdrop-blur-xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 rounded-2xl overflow-hidden relative" data-testid="card-main-feature">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <MessageSquare className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">É Só Mandar um Áudio ou Texto</h3>
                  <p className="text-muted-foreground mb-6">
                    Nada de formulários. Você fala naturalmente: "Comi um pão de queijo" ou "Fiz 3x10 de supino com 60kg" e pronto. A IA entende e registra tudo.
                  </p>
                  <div className="mt-8">
                    <img
                      src="/landing/generated_images/WhatsApp_AI_nutrition_chat_54896066.png"
                      alt="Conversa no WhatsApp com IA"
                      className="rounded-xl shadow-lg"
                      data-testid="img-whatsapp-chat"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              </Card>
            </motion.div>

            {features.slice(1).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="p-6 h-full backdrop-blur-sm bg-card/80 border-card-border hover-elevate rounded-2xl" data-testid={`card-feature-${index}`}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



