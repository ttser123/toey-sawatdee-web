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
    <div className="flex flex-col min-h-[70vh] justify-center space-y-16 py-12 animate-in fade-in duration-1000">
      <PortfolioHero 
        data={STATIC_HERO} 
        onViewResume={openResume} 
      />

      <ContactSection 
        contacts={STATIC_CONTACTS} 
        onViewResume={openResume}
      />

      <ResumeModal 
        isOpen={isResumeOpen} 
        onClose={closeResume} 
      />
    </div>
  );
}
