// src/app/overview/page.tsx — Overview (Detailed Infrastructure + Visual Flow)
'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { ValueProposition } from '@/components/landing/ValueProposition';
import { ArchitectureDetails } from '@/components/landing/ArchitectureDetails';

export default function OverviewPage() {
  return (
    <div className="space-y-8 sm:space-y-10 pb-10">
      <HeroSection />

      <ValueProposition />

      <ArchitectureDetails />
    </div>
  );
}
