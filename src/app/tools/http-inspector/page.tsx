'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ToolSkeleton = () => (
    <div className="w-full h-[500px] bg-slate-100 animate-pulse rounded-sm flex items-center justify-center">
        <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initializing HTTP Probe...</span>
    </div>
);

const HttpInspectorClientOnly = dynamic(
  () => import('@/components/tools/HttpInspectorTool'),
  {
    ssr: false,
    loading: () => <ToolSkeleton />,
  }
);

export default function HttpInspectorPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-8">
      <section className="space-y-4">
        <h3 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">
          [ Mission Control: HTTP Net Probe ]
        </h3>
        <HttpInspectorClientOnly />
      </section>
    </div>
  );
}
