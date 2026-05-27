// src/components/portfolio/ProjectSection.tsx
'use client';

import { ProjectDetail } from '@/lib/portfolio-types';

export function ProjectSection({ projects }: { projects: ProjectDetail[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">
          Sector_05: Primary_Deployment
        </h3>
        <div className="h-px flex-1 bg-slate-200 opacity-50" />
      </div>
      
      <div className="space-y-6">
        {projects.map((project, idx) => (
          <div key={idx} className="card-blueprint p-6 md:p-8 space-y-8 bg-white/70 backdrop-blur-md group hover:border-indigo-400 transition-colors">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <h4 className="text-xl font-black text-slate-800 uppercase font-mono tracking-tighter group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 rounded-sm border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-800 transition-all font-mono text-[10px] font-black uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-sm">code</span>
                    CODE_SOURCE
                  </a>
                )}
                {project.liveUrl && (
                  <a 
                    href={project.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 rounded-sm bg-slate-900 text-white hover:bg-indigo-600 transition-all font-mono text-[10px] font-black uppercase tracking-widest shadow-tactical"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    LIVE_PROD
                  </a>
                )}
              </div>
            </div>
            
            {/* Detailed Content (Engineering Focus) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                    <span className="h-0.5 w-2 bg-indigo-600" />
                    Infrastructure_Overview
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium font-mono italic pl-4 border-l-2 border-slate-100">
                    {`// ${project.description}`}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                    <span className="h-0.5 w-2 bg-indigo-600" />
                    Telemetry_Impact
                  </span>
                  <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-sm">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-3 font-mono">
                      <span className="material-symbols-outlined text-sm">analytics</span>
                      Result: {project.impact}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                  <span className="h-0.5 w-2 bg-indigo-600" />
                  Engineering_Achievements
                </span>
                <ul className="space-y-4">
                  {[
                    { label: "IaC_Orchestration", desc: "Architected a 100% Infrastructure-as-Code (IaC) environment utilizing Terraform to provision, manage, and orchestrate AWS resources." },
                    { label: "Edge_Topology", desc: "Engineered a globally distributed Next.js App Router (SSR) topology containerized via Docker on EC2 with CloudFront CDN optimization." },
                    { label: "Security_Protocol", desc: "Implemented a Zero-SSH CI/CD pipeline via GitHub Actions and AWS Systems Manager (SSM) for automated secure deployments." },
                    { label: "Serverless_Core", desc: "Developed a serverless RESTful API backend using AWS API Gateway and Python Lambda to aggregate real-time telemetry." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 text-xs text-slate-600 leading-relaxed group/item">
                      <span className="text-indigo-500 font-mono font-black shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono block leading-none">{item.label}</span>
                        <p className="font-medium text-[13px] leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
