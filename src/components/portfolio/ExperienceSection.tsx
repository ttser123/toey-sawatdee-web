// src/components/portfolio/ExperienceSection.tsx
'use client';

import { WorkExperience } from '@/lib/portfolio-types';

export function ExperienceSection({ experiences }: { experiences: WorkExperience[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">
          Sector_04: Work_Experience
        </h3>
        <div className="h-px flex-1 bg-slate-200 opacity-50" />
      </div>
      
      <div className="space-y-4">
        {experiences.map((exp, idx) => (
          <div key={idx} className="card-blueprint p-6 bg-white/70 backdrop-blur-md space-y-4 relative group hover:border-indigo-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-800 uppercase font-mono tracking-tight">{exp.role}</h4>
                <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest font-mono">{exp.company}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black font-mono text-slate-300 uppercase leading-none mb-1">Period_Interval</span>
                <span className="text-[10px] font-black font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-sm border border-slate-200">
                  {exp.period}
                </span>
              </div>
            </div>
            
            <ul className="space-y-3">
              {exp.achievements.map((achievement, i) => (
                <li key={i} className="flex gap-4 text-sm text-slate-600 leading-relaxed font-medium">
                  <span className="text-indigo-500 font-black mt-1 font-mono text-xs">[{String(i + 1).padStart(2, '0')}]</span>
                  <span className="flex-1">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
