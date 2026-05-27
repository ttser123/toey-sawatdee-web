// src/lib/portfolio-types.ts

export interface HeroSection {
  name: string;
  nickname?: string;
  title: string;        
  headline: string;     
  avatarUrl?: string;
  availability: string; // e.g., "Open for Full-time (Remote / Hybrid)"
  resumeUrl: string;    // PDF Link
}

export interface Metric {
  label: string;
  value: string;
  description?: string;
}

export interface SkillCategory {
  category: string;     
  skills: string[];     
}

export interface WorkExperience {
  company: string;
  role: string;
  period: string;       
  achievements: string[]; 
}

export interface ProjectDetail {
  title: string;
  description: string;  
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  impact?: string;      
}

export interface EducationDetail {
  institution: string;
  degree: string;
  period: string;
  gpa?: string;
}

export interface CertificationDetail {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface ContactChannel {
  platform: 'Email' | 'LinkedIn' | 'GitHub' | 'YouTube' | 'Resume';
  value: string;        
}

export interface PortfolioData {
  hero: HeroSection;
  metrics: Metric[];
  skills: SkillCategory[];
  experiences: WorkExperience[];
  projects: ProjectDetail[];
  education: EducationDetail[];
  certifications: CertificationDetail[];
  contacts: ContactChannel[];
}
