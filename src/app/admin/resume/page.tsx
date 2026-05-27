// src/app/admin/resume/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function ResumeAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { userEmail } = useAuth();
  
  // ── FIX 2: React Ref instead of direct DOM manipulation ────────────
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // ── FIX 1: Robust Validation (Type + Size) ────────────────────
      if (selectedFile.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'INVALID FILE TYPE: Only PDF documents are permitted.' });
        return;
      }

      // Max 10MB (10 * 1024 * 1024 bytes)
      if (selectedFile.size > 10485760) {
        setMessage({ type: 'error', text: 'FILE TOO LARGE: Document exceeds the 10MB limit.' });
        return;
      }

      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/resume', {
        method: 'POST',
        body: formData,
      });

      // ── FIX 3: Safe API Response Handling ──────────────────────────
      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      }

      if (res.ok) {
        setMessage({ type: 'success', text: 'DEPLOYMENT SUCCESS: Resume has been synchronized with S3 and Edge nodes.' });
        setFile(null);
        
        // Clear input using Ref
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage({ type: 'error', text: `UPLOADER FAILURE: ${data.error || `HTTP STATUS ${res.status}`}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'CRITICAL FAILURE: Connection to terminal lost or synchronization failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-blueprint p-6 bg-white/80 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-sm font-black text-slate-800 uppercase font-mono tracking-widest">
              Admin Management: Resume Terminal
            </h2>
          </div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Operator: <span className="text-indigo-600">{userEmail}</span>
          </p>
        </div>
      </div>

      {/* ── Main Control Panel ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card-blueprint p-8 bg-white space-y-8 relative overflow-hidden">
          {/* Blueprint Grid Background */}
          <div className="absolute inset-0 bg-dot-pattern opacity-5 pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-2 border-l-4 border-indigo-500 pl-4">
              <h3 className="text-lg font-black text-slate-800 uppercase font-mono tracking-tight">
                Document Deployment Sector
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Upload a new resume to update the public portfolio. This action will trigger a CloudFront cache invalidation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="group relative border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors p-12 text-center rounded-sm">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-indigo-400 transition-colors">
                    upload file
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs font-black font-mono text-slate-600 uppercase tracking-widest">
                      {file ? file.name : 'Select PDF Document'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">
                      Max file size: 10MB | Format: PDF
                    </p>
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-4 border font-mono text-[11px] uppercase tracking-wider ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      {message.type === 'success' ? 'check circle' : 'warning'}
                    </span>
                    {message.text}
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`w-full flex items-center justify-center gap-3 py-4 font-black font-mono text-xs uppercase tracking-[0.2em] shadow-tactical transition-all ${
                  !file || isUploading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                    : 'bg-slate-900 text-white hover:bg-indigo-600 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    EXECUTING DEPLOYMENT...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">publish</span>
                    START SYNCHRONIZATION
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="card-blueprint p-4 bg-slate-50 border-slate-200">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">info</span>
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase tracking-wider">
              System Notice: All deployments are logged. Ensure the document contains no sensitive private data before public synchronization. Cache propagation may take up to 60 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
