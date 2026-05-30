// src/app/resume/page.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// ── DYNAMIC IMPORTS ─────────────────────────────────────────────────
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });

export default function ResumeViewerPage() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);

  useEffect(() => {
    // Configure pdfjs worker only on client-side
    import('react-pdf').then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    });

    // Fetch resume last-modified timestamp from the status API
    fetch('/api/admin/resume/status')
      .then(res => { if (res.ok) return res.json(); throw new Error('STATUS_UNAVAILABLE'); })
      .then(data => { if (data.lastModified) setLastModified(data.lastModified); })
      .catch(() => { /* Status unavailable — field will remain hidden */ });
  }, []);

  function onDocumentLoadSuccess({ numPages: totalPages }: { numPages: number }) {
    setNumPages(totalPages);
    setIsLoading(false);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    console.error('[Resume] Load Error:', err);
    setIsLoading(false);
    setError(err.message.includes('Missing PDF') 
      ? 'FILE_NOT_FOUND: The resume has not been uploaded to the system yet.' 
      : 'BUFFER_LOAD_FAILURE: Unable to synchronize document streams.'
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* ── Control Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-blueprint p-4 bg-white/80 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${error ? 'bg-rose-500' : 'bg-indigo-500'}`} />
            <h2 className="text-sm font-black text-slate-800 uppercase font-mono tracking-widest">
              {error ? 'System Error: File Access Denied' : 'Document Viewer: Resume'}
            </h2>
          </div>
          {lastModified && !error && (
            <div className="flex items-center gap-2 ml-5">
              <span className="material-symbols-outlined text-[12px] text-slate-400">update</span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                Last Updated: {lastModified}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="/assets/resume.pdf" 
            download="Parinya_Sawatdee_Resume.pdf"
            className={`flex items-center gap-2 px-4 py-2 transition-all font-mono text-[10px] font-black uppercase tracking-widest ${
              error 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                : 'bg-slate-900 text-white hover:bg-indigo-600'
            }`}
            onClick={(e) => error && e.preventDefault()}
          >
            <span className="material-symbols-outlined text-sm">download</span>
            DOWNLOAD OFFLINE COPY
          </a>
        </div>
      </div>

      {/* ── PDF Document Container ─────────────────────────────────── */}
      <div className="flex justify-center bg-slate-100/50 border border-slate-200 rounded-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden group">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white/50 backdrop-blur-sm z-10">
            <div className="w-12 h-1 bg-slate-200 overflow-hidden rounded-full">
              <div className="w-1/2 h-full bg-indigo-500 animate-[loading-bar_1.5s_infinite_ease-in-out]" />
            </div>
            <p className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.3em]">
              Synchronizing Buffers...
            </p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-md mx-auto">
            <span className="material-symbols-outlined text-4xl text-rose-300">warning</span>
            <div className="space-y-2">
              <p className="text-xs font-black font-mono text-rose-600 uppercase tracking-widest">
                {error}
              </p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
                Please deploy the document via the Admin Management Terminal to initialize this sector.
              </p>
            </div>
          </div>
        ) : (
          <div className="shadow-2xl border border-slate-300 transition-transform duration-500 group-hover:scale-[1.01]">
            <Document
              file="/assets/resume.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
            >
              {/* Displaying first page as priority, common for resumes */}
              <Page 
                pageNumber={pageNumber} 
                width={typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth - 64 : 800}
                renderAnnotationLayer={true}
                renderTextLayer={true}
              />
            </Document>
          </div>
        )}

        {/* Blueprint Watermark */}
        <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none select-none">
          <p className="text-[40px] font-black font-mono text-slate-900 leading-none">ALPHA SYS</p>
          <p className="text-[10px] font-black font-mono text-slate-900 text-right uppercase tracking-[0.5em]">Restricted Access</p>
        </div>
      </div>

      {/* ── Multi-page Navigation (If needed) ────────────────────── */}
      {numPages && numPages > 1 && (
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 border border-slate-200 rounded-sm text-xs font-black font-mono disabled:opacity-30"
          >
            PREV_CHUNK
          </button>
          <span className="flex items-center text-xs font-black font-mono text-slate-500 uppercase tracking-widest px-4 border-x border-slate-100">
            DATA_SEGMENT {pageNumber} / {numPages}
          </span>
          <button 
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 border border-slate-200 rounded-sm text-xs font-black font-mono disabled:opacity-30"
          >
            NEXT_CHUNK
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
