import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { FaGithub, FaLinkedin, FaEnvelope, FaYoutube, FaFileAlt } from 'react-icons/fa';
import { HeroSection, ContactChannel } from '@/lib/portfolio-types';
export type { HeroSection, ContactChannel };
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Terminal, TypingAnimation, AnimatedSpan } from '@/components/ui/terminal';
import { Marquee } from '@/components/ui/marquee';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// ── Types ────────────────────────────────────────────────────────────

// ── Dynamic PDF Components ───────────────────────────────────────────

const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });

const RESUME_FILE_PATH = '/assets/resume.pdf';

// ── 1. Hero Section (Ultra-Minimal) ──────────────────────────────────

export function PortfolioHero({ data, onViewResume }: { data: HeroSection; onViewResume: () => void }) {
  return (
    <div className="pb-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto px-4 md:px-8">
      <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start gap-8 z-10">
        <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
          Adaptable Software Engineer experienced in building full-stack applications (Next.js) and provisioning secure, high-availability AWS environments. Proficient in cloud automation using Terraform (IaC), custom VPC routing, and CloudFront security optimization.
        </p>
        <ShimmerButton 
          onClick={onViewResume}
          className="inline-flex items-center gap-3 font-black font-mono text-xs px-8 py-4 uppercase tracking-widest transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)]"
          borderRadius="100px"
          background="#0f172a"
          shimmerColor="#818cf8"
        >
          <span className="material-symbols-outlined text-lg">description</span>
          View Resume
        </ShimmerButton>
      </div>

      <div className="flex-1 w-full max-w-lg relative z-10">
        <div className="absolute -inset-1 bg-indigo-500 rounded-xl blur opacity-20"></div>
        <Terminal className="bg-[#0f172a] border-slate-800 text-slate-300 shadow-2xl relative">
          <TypingAnimation>&gt; terraform init</TypingAnimation>
          <AnimatedSpan delay={1500} className="text-emerald-400">
            ✔ Initializing provider plugins...
          </AnimatedSpan>
          <AnimatedSpan delay={2000} className="text-emerald-400">
            ✔ Terraform has been successfully initialized!
          </AnimatedSpan>
          <TypingAnimation delay={2500}>&gt; terraform apply -auto-approve</TypingAnimation>
          <AnimatedSpan delay={4000} className="text-slate-400">
            aws_vpc.main: Creating...
          </AnimatedSpan>
          <AnimatedSpan delay={4500} className="text-slate-400">
            aws_subnet.public: Creating...
          </AnimatedSpan>
          <AnimatedSpan delay={5000} className="text-slate-400">
            aws_instance.web_server: Provisioning...
          </AnimatedSpan>
          <AnimatedSpan delay={6500} className="text-indigo-400 font-bold">
            Apply complete! Resources: 3 added, 0 changed, 0 destroyed.
          </AnimatedSpan>
          <AnimatedSpan delay={7000} className="text-slate-500 mt-2">
            Outputs:
          </AnimatedSpan>
          <AnimatedSpan delay={7200} className="text-emerald-400">
            instance_ip = "13.212.189.42"
          </AnimatedSpan>
          <TypingAnimation delay={8000}>&gt; ping 13.212.189.42</TypingAnimation>
          <AnimatedSpan delay={9500} className="text-slate-400">
            64 bytes from 13.212.189.42: icmp_seq=1 ttl=56 time=2.34 ms
          </AnimatedSpan>
          <AnimatedSpan delay={10000} className="text-emerald-500 font-bold mt-2">
            System Online. Ready for deployment.
          </AnimatedSpan>
        </Terminal>
      </div>
    </div>
  );
}

// ── 2. Resume Modal ─────────────────────────────────────────────────

export function ResumeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Fetch file status (Last Modified) from the system
      fetch('/api/admin/resume/status')
        .then(res => res.json())
        .then(data => {
          if (data.lastModified) setLastUpdated(data.lastModified);
        })
        .catch(err => console.error('Failed to fetch resume status:', err));

      import('react-pdf').then(({ pdfjs }) => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      });
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[95vh] md:h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-slate-700 shadow-2xl rounded-sm">
        <DialogHeader className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${error ? 'bg-rose-500' : 'bg-indigo-500'}`} />
              <div className="flex flex-col">
                <DialogTitle className="text-[20px] font-black text-slate-800 uppercase font-mono tracking-widest leading-none mb-1">
                  {error ? 'Error: Access Failed' : 'Document Viewer: Resume'}
                </DialogTitle>
                {lastUpdated && !error && (
                  <span className="text-[17px] font-mono text-slate-400 uppercase tracking-tighter">
                    File Last Modified: {lastUpdated}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 pr-6">
              <a href={RESUME_FILE_PATH} download="Parinya_Sawatdee_Resume.pdf" className="group flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-600 hover:text-white transition-all text-slate-500 rounded-sm border border-transparent hover:border-indigo-400">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest hidden md:block">Download PDF</span>
                <span className="material-symbols-outlined text-lg">download</span>
              </a>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-800 p-4 md:p-8 flex flex-col items-center custom-scrollbar relative gap-8">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-900/50 backdrop-blur-sm z-10">
              <div className="w-12 h-1 bg-slate-700 overflow-hidden rounded-full">
                <div className="w-1/2 h-full bg-indigo-500 animate-[loading-bar_1.5s_infinite_ease-in-out]" />
              </div>
              <p className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.3em]">Loading Document...</p>
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-md mx-auto text-white mt-20">
              <span className="material-symbols-outlined text-4xl text-rose-500">warning</span>
              <p className="text-xs font-black font-mono text-rose-500 uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <Document file={RESUME_FILE_PATH} onLoadSuccess={({ numPages }) => { setNumPages(numPages); setIsLoading(false); }} onLoadError={() => { setIsLoading(false); setError('FILE_NOT_FOUND'); }} className="flex flex-col items-center gap-8 pb-20">
              {Array.from(new Array(numPages), (_, i) => (
                <div key={i} className="shadow-2xl border-4 border-slate-700 bg-white">
                  <Page pageNumber={i + 1} width={typeof window !== 'undefined' ? (window.innerWidth < 768 ? window.innerWidth - 48 : 1000) : 1000} renderAnnotationLayer={true} renderTextLayer={true} />
                </div>
              ))}
            </Document>
          )}
        </div>
      </DialogContent>
      <style jsx global>{`
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; border: 2px solid #1e293b; }
      `}</style>
    </Dialog>
  );
}

// ── 3. Contact Section (Secure Channels) ───────────────────────────

export function ContactSection({ 
  contacts, 
  onViewResume 
}: { 
  contacts: ContactChannel[]; 
  onViewResume?: () => void;
}) {
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'Email': return <FaEnvelope />;
      case 'LinkedIn': return <FaLinkedin />;
      case 'GitHub': return <FaGithub />;
      case 'YouTube': return <FaYoutube />;
      case 'Resume': return <FaFileAlt />;
      default: return null;
    }
  };

  const getStyles = (platform: string) => {
    switch (platform) {
      case 'LinkedIn': return 'text-[#0a66c2] border-[#0a66c2]/40 bg-[#0a66c2]/5 hover:bg-[#0a66c2]/10 hover:border-[#0a66c2]/60';
      case 'GitHub': return 'text-slate-800 border-slate-300 bg-slate-100 hover:bg-slate-200 hover:border-slate-400';
      case 'YouTube': return 'text-rose-600 border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 hover:border-rose-400';
      case 'Resume': return 'text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 hover:border-indigo-400';
      default: return 'text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 hover:border-indigo-400';
    }
  };

  return (
    <footer className="w-full pt-12 pb-6 border-t border-slate-200 bg-transparent relative z-10 space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest font-mono">
          Direct Connection Channels
        </h3>
        <p className="text-slate-400 text-[9px] font-mono uppercase tracking-[0.3em]">
          For professional inquiries and collaborations
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* 1. Primary Social Links */}
        <div className="flex flex-wrap justify-center gap-4">
          {contacts.filter(c => c.platform !== 'Email').map((contact, idx) => (
            <a
              key={idx}
              href={contact.value}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all group ${getStyles(contact.platform)}`}
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                {getIcon(contact.platform)}
              </span>
              <span className="text-[10px] font-black font-mono uppercase tracking-wider">
                {contact.platform}
              </span>
            </a>
          ))}
        </div>

        {/* 2. Focused Email (High Visibility) */}
        {contacts.find(c => c.platform === 'Email') && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-800">
              <FaEnvelope className="text-sm shrink-0 text-slate-500" />
              <span className="text-xs sm:text-sm font-black font-mono select-all hover:text-indigo-600 transition-colors cursor-text tracking-wider">
                {contacts.find(c => c.platform === 'Email')?.value}
              </span>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}

// ── 4. Tech Stack Marquee (MagicUI) ────────────────────────────────
import { FaNetworkWired, FaLock, FaLinux, FaDatabase, FaAws } from 'react-icons/fa';
import { SiNextdotjs, SiTerraform, SiDocker, SiTypescript, SiPython, SiTailscale } from 'react-icons/si';

const CORE_TECH = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "AWS", icon: FaAws },
  { name: "Terraform", icon: SiTerraform },
  { name: "Docker", icon: SiDocker },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Python", icon: SiPython }
];

const INFRA_TECH = [
  { name: "TCP/IP", icon: FaNetworkWired },
  { name: "SSL/TLS", icon: FaLock },
  { name: "Tailscale", icon: SiTailscale },
  { name: "Linux", icon: FaLinux },
  { name: "DynamoDB", icon: FaDatabase }
];

export function TechMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-transparent py-6 mb-4 z-10 border-y border-slate-200 shadow-sm">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 w-full pt-2">
        <Marquee pauseOnHover className="[--duration:25s]">
          {CORE_TECH.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div key={idx} className="group flex items-center justify-center gap-3 px-6 py-2.5 mx-2 rounded-sm border border-slate-200 bg-white shadow-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-default">
                <Icon className="text-lg text-slate-500 group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-black font-mono text-slate-800 tracking-widest group-hover:text-indigo-600 transition-colors">{tech.name}</span>
              </div>
            );
          })}
        </Marquee>
        
        <Marquee reverse pauseOnHover className="[--duration:25s] mt-4 pb-4">
          {INFRA_TECH.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div key={idx} className="group flex items-center justify-center gap-3 px-6 py-2.5 mx-2 rounded-sm border border-slate-200 bg-white shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-default">
                <Icon className="text-lg text-slate-500 group-hover:text-emerald-500 transition-colors" />
                <span className="text-sm font-black font-mono text-slate-800 tracking-widest group-hover:text-emerald-600 transition-colors">{tech.name}</span>
              </div>
            );
          })}
        </Marquee>
      </div>
      
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent z-20"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent z-20"></div>
    </div>
  );
}
