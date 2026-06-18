// src/app/page.tsx — Consolidated Portfolio
'use client';

import React, { useState } from 'react';
import { 
  PortfolioHero, 
  ContactSection, 
  ResumeModal,
  type HeroSection, 
  type ContactChannel 
} from '@/components/portfolio/PortfolioComponents';
import { ProjectShowcase } from '@/components/portfolio/ProjectShowcase';
import { ScrollReveal } from '@/components/ScrollReveal';

// ── Static Data ──────────────────────────────────────────────────────

const STATIC_HERO: HeroSection = {
  name: "Parinya Sawatdee",
  nickname: "Toey", 
  headline: "",
  availability: "Available for Opportunities",
  resumeUrl: "/resume"
};

const STATIC_CONTACTS: ContactChannel[] = [
  { platform: "GitHub", value: "https://github.com/ttser123" },
  { platform: "LinkedIn", value: "https://linkedin.com/in/parinya-sawatdee" },
  { platform: "Email", value: "parinya.zawatdee@gmail.com" }
];

// ── Page Component ───────────────────────────────────────────────────

export default function Home() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const openResume = () => setIsResumeOpen(true);
  const closeResume = () => setIsResumeOpen(false);

  return (
    <div className="flex flex-col space-y-10 pt-4 pb-12">
      <ScrollReveal variant="fade-down">
        <PortfolioHero 
          data={STATIC_HERO} 
          onViewResume={openResume} 
        />
      </ScrollReveal>

      <ScrollReveal variant="scale-in">
        <ProjectShowcase />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <ContactSection 
          contacts={STATIC_CONTACTS} 
          onViewResume={openResume}
        />
      </ScrollReveal>

      <ResumeModal 
        isOpen={isResumeOpen} 
        onClose={closeResume} 
      />
    </div>
  );
}
