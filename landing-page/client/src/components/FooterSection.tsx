import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function FooterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email cadastrado:", email);
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Estamos selecionando os primeiros usuários para o{" "}
            <span className="text-primary">Beta Fechado</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Faça parte da revolução do fitness e saúde. Vagas limitadas disponíveis agora.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                required
                data-testid="input-email"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="bg-accent hover:bg-accent text-accent-foreground rounded-xl px-8"
              data-testid="button-early-access"
            >
              Solicitar Acesso
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mb-8">
            Ao se inscrever, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </motion.div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ZapNutri
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-terms">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-contact">
                Contato
              </a>
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm text-muted-foreground">
            © 2025 ZapNutri. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
