'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { ValueProposition } from '@/components/landing/ValueProposition';
import { ArchitectureDetails } from '@/components/landing/ArchitectureDetails';
import { InteractiveArchitecture } from '@/components/landing/InteractiveArchitecture';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function OverviewPage() {
  return (
    <div className="space-y-8 sm:space-y-10 pb-10">
      <ScrollReveal variant="fade-down">
        <HeroSection />
      </ScrollReveal>

      <ScrollReveal variant="scale-in">
        <InteractiveArchitecture />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <ValueProposition />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <ArchitectureDetails />
      </ScrollReveal>
    </div>
  );
}
