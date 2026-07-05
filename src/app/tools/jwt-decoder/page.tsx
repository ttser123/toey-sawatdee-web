'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ToolSkeleton = () => (
    <div className="w-full h-[600px] bg-slate-100 animate-pulse rounded-sm flex items-center justify-center">
        <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initialising Module...</span>
    </div>
);

const JwtToolClientOnly = dynamic(
  () => import('@/components/tools/JwtTool'),
  {
    ssr: false,
    loading: () => <ToolSkeleton />,
  }
);

export default function JwtDecoderPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-8">
      <section className="space-y-4">
        <h3 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">
          [ Mission Control: JWT Inspector ]
        </h3>
        <JwtToolClientOnly />
      </section>
    </div>
  );
}
