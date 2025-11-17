import HeroSection from "@landing/components/HeroSection";
import ProblemSection from "@landing/components/ProblemSection";
import SolutionSection from "@landing/components/SolutionSection";
import TargetAudienceSection from "@landing/components/TargetAudienceSection";
import HowItWorksSection from "@landing/components/HowItWorksSection";
import SocialProofSection from "@landing/components/SocialProofSection";
import FooterSection from "@landing/components/FooterSection";
import ThemeToggle from "@landing/components/ThemeToggle";
import Link from "next/link";
import { Button } from "@landing/components/ui/button";
import React from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Sticky Header with transparent -> opaque transition */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/landing/logo_zapNutri.png"
                alt="ZapNutri"
                className="w-auto h-10 sm:h-12"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-lg sm:text-xl font-bold">ZapNutri</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" data-testid="button-login" className="px-3 py-1.5 text-sm">
                  Entrar
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <TargetAudienceSection />
      <HowItWorksSection />
      <SocialProofSection />
      <FooterSection />
    </div>
  );
}


