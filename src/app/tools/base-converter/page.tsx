'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ToolSkeleton = () => (
    <div className="w-full h-[400px] bg-slate-100 animate-pulse rounded-sm flex items-center justify-center">
        <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initializing Base Matrix...</span>
    </div>
);

const BaseConverterClientOnly = dynamic(
  () => import('@/components/tools/BaseConverterTool'),
  {
    ssr: false,
    loading: () => <ToolSkeleton />,
  }
);

export default function BaseConverterPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-8">
      <section className="space-y-4">
        <h3 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">
          [ Mission Control: Base Matrix ]
        </h3>
        <BaseConverterClientOnly />
      </section>
    </div>
  );
}
