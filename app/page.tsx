import Hero from "@/components/landing/Hero";
import TheTruth from "@/components/landing/TheTruth";
import TheSolution from "@/components/landing/TheSolution";
import NutritionistSection from "@/components/landing/NutritionistSection";
import PersonalTrainerSection from "@/components/landing/PersonalTrainerSection";
import BetaCTA from "@/components/landing/BetaCTA";
import Header from "@/components/landing/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-background overflow-x-hidden">
      <Header />
      <Hero />
      <TheTruth />
      <TheSolution />
      <NutritionistSection />
      <PersonalTrainerSection />

      {/* Final CTA Section */}
      <section className="py-24 bg-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Comece agora. É grátis para Beta Testers.
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
            Não deixe para segunda-feira. Sua transformação começa na próxima refeição.
          </p>
          <BetaCTA variant="secondary" text="Quero ser Beta Tester" className="!text-emerald-700 hover:!bg-emerald-50" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 ZapNutri AI. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Termos</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
