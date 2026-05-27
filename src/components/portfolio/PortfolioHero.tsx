// src/components/portfolio/PortfolioHero.tsx
'use client';

import { HeroSection } from '@/lib/portfolio-types';

export function PortfolioHero({ data }: { data: HeroSection }) {
  return (
    <div className="card-blueprint p-6 md:p-8 bg-white/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-300 transition-colors">
      {/* Decorative Blueprint Corner */}
      <div className="absolute top-0 right-0 p-1 flex gap-0.5 opacity-20">
        <div className="h-0.5 w-4 bg-slate-400" />
        <div className="h-0.5 w-0.5 bg-slate-400" />
      </div>

      <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
        <div className="space-y-6 flex-1 w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase font-mono">
                {data.name} {data.nickname && <span className="text-slate-300">[{data.nickname}]</span>}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-indigo-600 opacity-30" />
              <p className="text-indigo-600 font-bold font-mono text-sm md:text-base tracking-widest uppercase">
                {data.title}
              </p>
            </div>
          </div>
          
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed font-medium font-mono">
            {`> ${data.headline}`}
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <a 
              href={data.resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-black font-mono text-xs px-5 py-3 rounded-sm shadow-tactical transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-base">download</span>
              EXTRACT_RESUME.PDF
            </a>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 bg-emerald-400 rounded-full animate-radar-ping opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-black font-mono text-slate-500 uppercase tracking-widest">
                Status: {data.availability}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
