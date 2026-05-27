// src/components/portfolio/SkillSection.tsx
'use client';

import { SkillCategory } from '@/lib/portfolio-types';

export function SkillSection({ skills }: { skills: SkillCategory[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((cat) => (
        <div key={cat.category} className="card-blueprint p-4 bg-white/50 backdrop-blur-sm space-y-3 flex flex-col group hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] font-mono leading-none">
              {cat.category}
            </h3>
            <div className="flex gap-0.5 opacity-30">
              <div className="h-0.5 w-1.5 bg-indigo-400" />
              <div className="h-0.5 w-0.5 bg-indigo-400" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cat.skills.map((skill) => (
              <span 
                key={skill} 
                className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold font-mono rounded-sm hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
