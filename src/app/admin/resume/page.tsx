'use client';

import { useState, useCallback } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import HudHeader from '@/components/HudHeader';

export default function ResumeAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', msg: string }>({ type: 'idle', msg: '' });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setStatus({ type: 'error', msg: 'Error: Only PDF files are permitted.' });
        return;
      }
      setFile(selectedFile);
      setStatus({ type: 'idle', msg: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus({ type: 'idle', msg: 'Initializing secure upload sequence...' });

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) throw new Error('Authorization token not found.');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Success: Resume deployed and CDN invalidated.' });
        setFile(null);
      } else {
        throw new Error(result.error || 'Upload failed.');
      }
    } catch (err: unknown) {
      console.error('[Admin] Upload Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setStatus({ type: 'error', msg: `Critical Failure: ${errorMessage}` });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card-blueprint p-8 bg-white/80 backdrop-blur-md relative overflow-hidden group border-slate-300">
        <div className="space-y-6 relative z-10">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-800 uppercase font-mono tracking-tight">
              Resume_Management_Terminal
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
              Role: System Administrator // Secure Node
            </p>
          </div>

          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-sm p-12 text-center transition-all ${
                file ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
              }`}
            >
              <input 
                type="file" 
                id="resume-upload" 
                className="hidden" 
                accept=".pdf"
                onChange={onFileChange}
                disabled={isUploading}
              />
              <label 
                htmlFor="resume-upload" 
                className="cursor-pointer space-y-3 block"
              >
                <span className="material-symbols-outlined text-4xl text-slate-300 block">
                  {file ? 'task' : 'cloud_upload'}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-600 uppercase font-mono">
                    {file ? file.name : 'Select Resume (PDF)'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Drag and drop or click to browse'}
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {status.type !== 'idle' && (
                  <p className={`text-[10px] font-black font-mono uppercase tracking-widest ${
                    status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {status.msg}
                  </p>
                )}
                {isUploading && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <p className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-[0.3em] animate-pulse">
                      Processing_Protocol...
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`px-6 py-3 rounded-sm font-black font-mono text-xs uppercase tracking-[0.2em] transition-all shadow-tactical ${
                  !file || isUploading 
                    ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 text-white hover:bg-indigo-600'
                }`}
              >
                {isUploading ? 'SYNCING...' : 'INIT_DEPLOYMENT'}
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Decoration */}
        <div className="absolute top-0 right-0 p-1 flex gap-0.5 opacity-20">
          <div className="h-0.5 w-4 bg-slate-400" />
          <div className="h-0.5 w-0.5 bg-slate-400" />
        </div>
      </div>
    </div>
  );
}
