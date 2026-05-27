// src/components/portfolio/MetricSnapshot.tsx
'use client';

import { Metric } from '@/lib/portfolio-types';

export function MetricSnapshot({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div key={idx} className="card-blueprint p-4 bg-white/60 backdrop-blur-sm space-y-2 hover:border-indigo-300 transition-colors group">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono leading-none">
              {metric.label}
            </span>
            <div className="flex gap-0.5">
              <div className="h-0.5 w-2 bg-slate-100" />
              <div className="h-0.5 w-0.5 bg-slate-200" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-slate-800 font-mono tracking-tighter group-hover:text-indigo-600 transition-colors">
              {metric.value}
            </span>
            {metric.description && (
              <span className="text-[8px] font-mono text-slate-400 uppercase">{metric.description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
