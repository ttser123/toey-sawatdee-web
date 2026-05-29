'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// 🛠️ TACTICAL ARCHITECTURE: Force Client-Side Only rendering
// This eliminates Error #004 (SSR dimension issues) by ensuring React Flow 
// only mounts when the browser DOM is fully available.
const BlastRadiusGraphClientOnly = dynamic(
  () => import('@/components/tools/BlastRadiusGraph'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[800px] w-full border-2 border-slate-900 bg-slate-50 flex items-center justify-center font-mono text-[10px] uppercase text-slate-400">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mr-2" />
        Initializing Visualization Engine...
      </div>
    )
  }
);

export default function EnvTrackerPage() {
  return (
    <div className="grid grid-cols-1 gap-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">
            [ Mission Control: Dependency Mapping ]
          </h3>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-900" />
              <span>SOURCE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-200 border border-slate-400" />
              <span>CONSUMER</span>
            </div>
          </div>
        </div>
        
        {/* RENDER_CHASSIS: CLIENT_ONLY */}
        <BlastRadiusGraphClientOnly />
      </section>
    </div>
  );
}
