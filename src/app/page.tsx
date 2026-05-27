// src/app/page.tsx — Portfolio (SOLID/SoC Refactor - Detailed Layout)
'use client';

import { portfolioData } from '@/lib/portfolio-data';
import { PortfolioHero } from '@/components/portfolio/PortfolioHero';
import { MetricSnapshot } from '@/components/portfolio/MetricSnapshot';
import { SkillSection } from '@/components/portfolio/SkillSection';
import { ExperienceSection } from '@/components/portfolio/ExperienceSection';
import { ProjectSection } from '@/components/portfolio/ProjectSection';
import { EducationSection } from '@/components/portfolio/EducationSection';
import { ContactSection } from '@/components/portfolio/ContactSection';

export default function Home() {
  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section (Immediate Scan) */}
      <PortfolioHero data={portfolioData.hero} />

      {/* 3. Tech Skills Grid (Categorized Arsenal) */}
      <section className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter font-mono flex items-center gap-3">
          Tech Stack
        </h3>
        <SkillSection skills={portfolioData.skills} />
      </section>

      {/* 4. Work Experience (Results-oriented) */}
      <ExperienceSection experiences={portfolioData.experiences} />

      {/* 5. Featured Projects (The Armory) */}
      <ProjectSection projects={portfolioData.projects} />

      {/* 7. Secured Contact (Secure Channels) */}
      <ContactSection contacts={portfolioData.contacts} />
    </div>
  );
}
