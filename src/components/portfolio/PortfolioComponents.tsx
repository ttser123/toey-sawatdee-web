// src/components/portfolio/PortfolioComponents.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaGithub, FaLinkedin, FaEnvelope, FaYoutube, FaFileAlt } from 'react-icons/fa';
import { HeroSection, ContactChannel } from '@/lib/portfolio-types';
export type { HeroSection, ContactChannel };
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// ── Types ────────────────────────────────────────────────────────────

// ── Dynamic PDF Components ───────────────────────────────────────────

const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });

const RESUME_FILE_PATH = '/assets/resume.pdf';

// ── 1. Hero Section (Ultra-Minimal) ──────────────────────────────────

export function PortfolioHero({ data, onViewResume }: { data: HeroSection; onViewResume: () => void }) {
  return (
    <div className="card-blueprint p-8 md:p-12 bg-white/80 backdrop-blur-md relative overflow-hidden border-slate-200 shadow-sm text-center md:text-left">
      <div className="space-y-6 relative z-10">
        <div className="space-y-2">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tighter uppercase font-mono leading-none">
            {data.name} {data.nickname && <span className="text-slate-300">[{data.nickname}]</span>}
          </h2>
          <p className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.3em]">
            {data.availability}
          </p>
        </div>
        
        <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0 mb-8">
          {data.headline}
        </p>
        
        <div className="pt-4">
          <button 
            onClick={onViewResume}
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-indigo-600 text-white font-black font-mono text-xs px-8 py-4 rounded-sm shadow-tactical transition-all hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-lg">description</span>
            View Resume
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2. Resume Modal ─────────────────────────────────────────────────

export function ResumeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      import('react-pdf').then(({ pdfjs }) => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-2 md:p-8 animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-5xl h-[95vh] md:h-full flex flex-col bg-white border border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${error ? 'bg-rose-500' : 'bg-indigo-500'}`} />
            <h2 className="text-xs font-black text-slate-800 uppercase font-mono tracking-widest">
              {error ? 'Error: Access_Failed' : 'Document Viewer: Resume'}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <a href={RESUME_FILE_PATH} download="Parinya_Sawatdee_Resume.pdf" className="group flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-600 hover:text-white transition-all text-slate-500 rounded-sm border border-transparent hover:border-indigo-400">
              <span className="text-[10px] font-black font-mono uppercase tracking-widest hidden md:block">Download PDF</span>
              <span className="material-symbols-outlined text-lg">download</span>
            </a>
            <button onClick={onClose} className="group flex items-center gap-2 px-3 py-1.5 hover:bg-rose-500 hover:text-white transition-all text-slate-500 rounded-sm">
              <span className="text-[10px] font-black font-mono uppercase tracking-widest group-hover:block hidden md:block">Close Viewer</span>
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

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
                  <Page pageNumber={i + 1} width={typeof window !== 'undefined' ? (window.innerWidth < 768 ? window.innerWidth - 48 : 800) : 800} renderAnnotationLayer={true} renderTextLayer={true} />
                </div>
              ))}
            </Document>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; border: 2px solid #1e293b; }
      `}</style>
    </div>
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

  const getHoverStyles = (platform: string) => {
    switch (platform) {
      case 'Email': return 'hover:text-slate-800 hover:border-slate-800 hover:bg-slate-100';
      case 'LinkedIn': return 'hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50';
      case 'GitHub': return 'hover:text-slate-900 hover:border-slate-900 hover:bg-slate-100';
      case 'YouTube': return 'hover:text-rose-600 hover:border-rose-400 hover:bg-rose-50/50';
      case 'Resume': return 'hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50';
      default: return 'hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-500/10';
    }
  };

  return (
    <div className="card-blueprint p-8 bg-white/80 backdrop-blur-md relative overflow-hidden">
      <div className="relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter font-mono">
            Direct Connection Channels
          </h3>
          <p className="text-slate-400 text-[10px] font-mono uppercase tracking-[0.3em]">
            For professional inquiries and collaborations
          </p>
        </div>

        <div className="flex flex-col items-center gap-10">
          {/* 1. Primary Social Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {contacts.filter(c => c.platform !== 'Email').map((contact, idx) => (
              <a
                key={idx}
                href={contact.value}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-5 py-2.5 rounded-sm border border-slate-200 bg-white text-slate-500 transition-all group ${getHoverStyles(contact.platform)}`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {getIcon(contact.platform)}
                </span>
                <span className="text-xs font-black font-mono uppercase tracking-widest">
                  {contact.platform}
                </span>
              </a>
            ))}
          </div>

          {/* 2. Focused Email (High Visibility) */}
          {contacts.find(c => c.platform === 'Email') && (
            <div className="flex flex-col items-center gap-3 py-6 px-8 border-t border-slate-100 w-full max-w-2xl">
              <div className="flex items-center gap-4 text-slate-800">
                <FaEnvelope className="text-base md:text-xl shrink-0 text-slate-800" />
                <span className="text-lg sm:text-xl md:text-2xl font-black font-mono select-all hover:text-indigo-600 transition-colors cursor-text tracking-tight">
                  {contacts.find(c => c.platform === 'Email')?.value}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col items-center gap-4">
        </div>
      </div>
    </div>
  );
}
