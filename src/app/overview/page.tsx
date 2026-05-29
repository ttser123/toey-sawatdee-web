// src/app/overview/page.tsx — Overview (Detailed Infrastructure + Visual Flow)
'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/landing/HeroSection';
import { ValueProposition } from '@/components/landing/ValueProposition';
import { ArchitectureDetails } from '@/components/landing/ArchitectureDetails';

// 🛠️ TACTICAL ARCHITECTURE: Client-Side Only Visualization Center
const SystemVisualizer = dynamic(
  () => import('@/components/landing/SystemVisualizer'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full border-2 border-slate-900 bg-slate-50 flex items-center justify-center font-mono text-[10px] uppercase text-slate-400">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mr-2" />
        Booting Visualization Command Center...
      </div>
    )
  }
);

export default function OverviewPage() {
  return (
    <div className="space-y-8 sm:space-y-10 pb-10">
      <HeroSection />

      <SystemVisualizer />

      <ValueProposition />

      <ArchitectureDetails />
    </div>
  );
}
