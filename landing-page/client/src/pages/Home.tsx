import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SocialProofSection from "@/components/SocialProofSection";
import FooterSection from "@/components/FooterSection";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
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
