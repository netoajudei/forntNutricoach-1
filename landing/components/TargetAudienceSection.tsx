import { motion } from "framer-motion";
import { Card } from "@landing/components/ui/card";
import { Button } from "@landing/components/ui/button";
import { Target, Briefcase } from "lucide-react";
import Link from "next/link";

export default function TargetAudienceSection() {
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
            Para Quem É o <span className="text-primary">ZapNutri</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma solução completa para quem busca resultados na dieta e treino, e para os profissionais que acompanham.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden h-full backdrop-blur-sm bg-card/80 border-card-border hover-elevate rounded-2xl" data-testid="card-for-users">
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/landing/generated_images/Woman_training_at_gym_0996f4c7.png"
                  alt="Pessoa treinando na academia"
                  className="w-full h-full object-cover"
                  data-testid="img-gym"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Para o Aluno</h3>
                <p className="text-muted-foreground mb-6">
                  Para quem quer resultado sem burocracia. Sem apps complicados, sem perder tempo 
                  digitando, sem desculpas. Apenas você e seus objetivos, com suporte 24/7.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Registro de refeições e treinos por áudio/texto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Acompanhamento de progressão de carga</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Feedback imediato e ajustes automáticos</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full" variant="outline" data-testid="button-for-users">
                    Começar Agora
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden h-full backdrop-blur-sm bg-card/80 border-card-border hover-elevate rounded-2xl" data-testid="card-for-professionals">
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/landing/generated_images/Nutritionist_with_health_dashboard_59f32155.png"
                  alt="Nutricionista com dashboard"
                  className="w-full h-full object-cover"
                  data-testid="img-professional"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Para o Profissional</h3>
                <p className="text-muted-foreground mb-6">
                  Para Nutricionistas e Personal Trainers que querem fidelizar alunos e ter dados 
                  reais de adesão. Monitore alimentação, frequência de treino e progressão em tempo real.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span className="text-sm">Dados reais de dieta e treinos dos alunos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span className="text-sm">Monitoramento de frequência e progressão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span className="text-sm">Intervenção oportuna e maior retenção</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" data-testid="button-for-professionals">
                  Saber Mais
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


