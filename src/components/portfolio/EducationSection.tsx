// src/components/portfolio/EducationSection.tsx
'use client';

import { EducationDetail, CertificationDetail } from '@/lib/portfolio-types';

interface EducationSectionProps {
  education: EducationDetail[];
  certifications: CertificationDetail[];
}

export function EducationSection({ education, certifications }: EducationSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Education */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">
            Sector_06: Education
          </h3>
          <div className="h-px flex-1 bg-slate-200 opacity-50" />
        </div>
        <div className="space-y-4">
          {education.map((edu, idx) => (
            <div key={idx} className="card-blueprint p-6 bg-white/60 backdrop-blur-sm space-y-3 group hover:border-indigo-300 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-sm font-black text-slate-800 uppercase font-mono leading-tight tracking-tight">{edu.degree}</h4>
                <span className="text-[9px] font-black font-mono text-slate-400 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded-sm border border-slate-100">{edu.period}</span>
              </div>
              <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest font-mono">{edu.institution}</p>
              {edu.gpa && (
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <span className="text-[9px] font-black text-slate-300 uppercase font-mono tracking-widest">Protocol: GPA_MEASURE</span>
                  <span className="text-xs font-black font-mono text-emerald-600">{edu.gpa}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">
            Sector_07: Credentials
          </h3>
          <div className="h-px flex-1 bg-slate-200 opacity-50" />
        </div>
        <div className="space-y-4">
          {certifications.map((cert, idx) => (
            <div key={idx} className="card-blueprint p-6 bg-white/60 backdrop-blur-sm space-y-3 group hover:border-emerald-300 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-sm font-black text-slate-800 uppercase font-mono leading-tight tracking-tight group-hover:text-emerald-600 transition-colors">
                  {cert.name}
                </h4>
                <span className="text-[9px] font-black font-mono text-slate-400 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded-sm border border-slate-100">{cert.date}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest font-mono">{cert.issuer}</p>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1">
                    <span className="text-[9px] font-black font-mono uppercase tracking-widest">Verify</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
