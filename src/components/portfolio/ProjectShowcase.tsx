import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGithub } from 'react-icons/fa';
import { PROJECTS_DATA, type ProjectItem } from '@/data/projects';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// ── UI Component ───────────────────────────────────────────────────
export function ProjectShowcase() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProjectAction = (project: ProjectItem) => {
    if (project.liveUrl) {
      if (project.liveUrl.startsWith('/')) {
        router.push(project.liveUrl);
      } else {
        window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
      }
    } else if (project.details) {
      setSelectedProject(project);
    }
  };

  return (
    <div className="w-full relative">
      {/* ── Section Header ── */}
      <div className="text-center md:text-left mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tighter font-mono flex items-center justify-center md:justify-start gap-2">
          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-none inline-block shadow-[2px_2px_0px_0px_rgba(15,23,42,0.3)]"></span>
          Deployed Systems & Projects
        </h2>
        <div className="h-1 w-20 bg-indigo-600 mx-auto md:mx-0"></div>
      </div>

      {/* ── Grid Layout Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {PROJECTS_DATA.map((project, index) => (
          <div 
            key={project.id} 
            className={`card-blueprint flex flex-col bg-white/80 backdrop-blur-sm border transition-all duration-300 hover:border-indigo-400 relative overflow-hidden group ${
              project.featured 
                ? 'border-l-4 border-l-indigo-600 border-t-slate-300 border-r-slate-300 border-b-slate-300 rounded-sm' 
                : 'border-slate-300 rounded-sm'
            }`}
          >
            {project.featured && (
              <span className="absolute top-0 right-0 z-20 bg-indigo-600 text-white text-[8px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-none border-b border-l border-indigo-700">
                Featured
              </span>
            )}

            {/* 🛠️ S3 Image Thumbnail (ใช้ Next/Image ป้องกันเซิร์ฟเวอร์บวม) */}
            {project.imageUrl && (
              <div 
                onClick={() => handleProjectAction(project)}
                className="w-full h-48 overflow-hidden relative border-b border-slate-200 cursor-pointer"
              >
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-20"></div>
                <Image 
                   src={project.imageUrl} 
                   alt={project.title}
                   fill
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                   className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 z-10"
                   priority={project.featured || index === 0} // เร่งโหลดรูป Featured หรือรูปแรกสุด (LCP) ทันทีที่เปิดเว็บ
                />
              </div>
            )}

            <div className="p-6 flex flex-col flex-1">
              <div className="mb-4">
                <span className="text-[9px] font-black font-mono text-indigo-600 uppercase tracking-wider mb-1.5 block">
                  {"// "}{project.category}
                </span>
                <h3 
                  onClick={() => handleProjectAction(project)}
                  className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {project.title}
                </h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map((tech, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-600 text-[9px] font-mono font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-slate-200">
                    {tech}
                  </span>
                ))}
              </div>

              {/* ── Footer Actions (ปุ่มฉลาดเลือก) ── */}
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-200">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-[10px] font-black font-mono uppercase tracking-widest">
                    <FaGithub className="text-base text-slate-500 group-hover:text-slate-800" /> Source
                  </a>
                )}
                
                {project.liveUrl ? (
                  project.liveUrl.startsWith('/') ? (
                    <Link href={project.liveUrl} className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 text-[10px] font-black font-mono uppercase tracking-widest ml-auto">
                      Live Demo <span className="material-symbols-outlined text-xs align-middle">arrow_forward</span>
                    </Link>
                  ) : (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 text-[10px] font-black font-mono uppercase tracking-widest ml-auto">
                      Live Demo <span className="material-symbols-outlined text-xs align-middle">open_in_new</span>
                    </a>
                  )
                ) : project.details ? (
                  <button onClick={() => setSelectedProject(project)} className="text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-[10px] font-black font-mono uppercase tracking-widest ml-auto animate-pulse-subtle">
                    Read Case Study <span className="material-symbols-outlined text-xs align-middle">read_more</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Case Study Modal (Rich Text Render Engine) ── */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        {selectedProject && selectedProject.details && mounted && (
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-slate-300 shadow-2xl rounded-sm">
            
            {/* ── Modal Header ── */}
            <DialogHeader className="p-5 border-b border-slate-200 bg-slate-50 shrink-0 text-left">
              <div>
                <span className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-wider block mb-1">
                  {"// Engineering Case Study"}
                </span>
                <DialogTitle className="text-xl md:text-2xl font-black font-sans text-slate-800 tracking-tight">
                  {selectedProject.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Case study details for {selectedProject.title}
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* ── Modal Article Content ── */}
            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
              
              {/* 1. Executive Summary (สรุปย่อให้ CTO อ่านไวๆ) */}
              <div className="mb-12 p-6 bg-slate-50 border border-slate-200 rounded-sm space-y-4">
                <div>
                  <h4 className="text-xs font-black font-mono text-indigo-600 uppercase tracking-widest mb-2">The Problem</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedProject.details.problem}</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-black font-mono text-indigo-600 uppercase tracking-widest mb-2">The Solution</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedProject.details.solution}</p>
                </div>
              </div>

              {/* 2. Deep Dive Sections (ลอจิกวนลูปวาดบทความ + รูปภาพ) */}
              <div className="space-y-16">
                {selectedProject.details.deepDive.map((section, idx) => (
                  <div key={idx} className="space-y-6">
                    
                    {/* เรนเดอร์หัวข้อ (ถ้ามี) */}
                    {section.heading && (
                      <h4 className="text-lg md:text-xl font-black text-slate-800 border-b border-slate-100 pb-3 font-mono">
                        {"# "}{section.heading}
                      </h4>
                    )}
                    
                    {/* เรนเดอร์รูปภาพแทรกระหว่างเนื้อหา (ถ้ามี) */}
                    {section.imageUrl && (
                      <div className="relative w-full h-[250px] md:h-[400px] border border-slate-200 shadow-sm rounded-sm overflow-hidden bg-slate-50">
                        <Image 
                          src={section.imageUrl} 
                          alt={section.heading || 'Architecture detail'} 
                          fill 
                          className="object-contain" // ใช้ contain รูปจะได้ไม่โดนตัดแหว่งเวลาโชว์ Diagram
                        />
                      </div>
                    )}
                    
                    {/* 🛠️ เอนจิ้นหั่นพารากราฟ: ถ้าพิมพ์ \n ใน String มันจะถูกแปลงเป็น <p> แยกกันอัตโนมัติ! */}
                    <div className="text-sm md:text-base text-slate-600 leading-loose font-sans space-y-4">
                      {section.body.split('\n').map((paragraph, pIdx) => (
                        paragraph.trim() !== '' && (
                          <p key={pIdx}>{paragraph}</p>
                        )
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
