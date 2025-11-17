import { motion } from "framer-motion";
import { Card } from "@landing/components/ui/card";
import { Avatar, AvatarFallback } from "@landing/components/ui/avatar";
import { Star, Users, TrendingUp, Award } from "lucide-react";
import { useState, useEffect } from "react";

const stats = [
  { icon: Users, value: 500, label: "Beta Testers", suffix: "+" },
  { icon: TrendingUp, value: 89, label: "Taxa de Adesão", suffix: "%" },
  { icon: Award, value: 4.9, label: "Avaliação Média", suffix: "/5" },
];

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          const increment = end / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${end}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span id={`counter-${end}`}>
      {count}
      {suffix}
    </span>
  );
}

export default function SocialProofSection() {
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
            Junte-se à <span className="text-primary">Revolução do Fitness</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja o que nossos primeiros usuários estão dizendo sobre o ZapNutri.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 text-center backdrop-blur-sm bg-card/80 border-card-border rounded-2xl" data-testid={`card-stat-${index}`}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              name: "Maria Silva",
              role: "Estudante",
              initials: "MS",
              content: "Finalmente consigo manter minha dieta e treino! Só mando áudio enquanto como ou saio da academia. A IA registra tudo. Perdi 8kg em 2 meses.",
              rating: 5,
            },
            {
              name: "João Santos",
              role: "Personal Trainer",
              initials: "JS",
              content: "Revolucionou meu trabalho! Vejo a frequência de treino e progressão de carga dos alunos em tempo real. Consigo intervir antes que desistam.",
              rating: 5,
            },
            {
              name: "Ana Oliveira",
              role: "Nutricionista",
              initials: "AO",
              content: "Meus pacientes adoram a praticidade. A taxa de adesão aumentou 70% desde que comecei a usar o ZapNutri. Dados reais fazem toda diferença!",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 h-full backdrop-blur-sm bg-card/80 border-card-border hover-elevate rounded-2xl" data-testid={`card-testimonial-${index}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.content}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



