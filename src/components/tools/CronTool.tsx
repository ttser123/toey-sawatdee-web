'use client';

import React from 'react';
import { useCronTool } from '@/hooks/useCronTool';

export default function CronTool() {
  const { cronExpression, setCronExpression, result, upcomingCount, setUpcomingCount } = useCronTool();

  return (
    <div className="card-blueprint p-6 md:p-8 space-y-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">schedule</span>
          <div>
            <h2 className="text-slate-900 font-black uppercase tracking-widest text-sm">Cron Schedule Engine</h2>
            <p className="text-slate-400 text-xs font-mono">SYSTEM: CRON_VISUALIZER_v1</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          SYNCED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Cron Expression</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">code</span>
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="* * * * *"
                className={`w-full bg-slate-50 border ${result && !result.isValid && cronExpression.trim() ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 text-rose-700' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-indigo-700'} rounded-sm py-3 pl-9 pr-4 text-lg font-mono font-bold focus:outline-none focus:ring-1 transition-colors shadow-none tracking-widest`}
                spellCheck={false}
              />
            </div>
            
            {result && !result.isValid && cronExpression.trim() && (
              <p className="text-xs text-rose-500 font-mono mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Invalid Syntax: {result.error}
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Syntax Reference</h4>
            <div className="font-mono text-xs text-slate-600 grid grid-cols-5 gap-2 text-center pt-2">
              <div className="space-y-1">
                <div className="font-black text-indigo-600 text-lg">*</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Minute</div>
                <div className="text-[8px] text-slate-400">(0-59)</div>
              </div>
              <div className="space-y-1">
                <div className="font-black text-indigo-600 text-lg">*</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Hour</div>
                <div className="text-[8px] text-slate-400">(0-23)</div>
              </div>
              <div className="space-y-1">
                <div className="font-black text-indigo-600 text-lg">*</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Day</div>
                <div className="text-[8px] text-slate-400">(1-31)</div>
              </div>
              <div className="space-y-1">
                <div className="font-black text-indigo-600 text-lg">*</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Month</div>
                <div className="text-[8px] text-slate-400">(1-12)</div>
              </div>
              <div className="space-y-1">
                <div className="font-black text-indigo-600 text-lg">*</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Week</div>
                <div className="text-[8px] text-slate-400">(0-7)</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Common Templates</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Every Minute', val: '* * * * *' },
                { label: 'Every 15 Mins', val: '*/15 * * * *' },
                { label: 'Hourly', val: '0 * * * *' },
                { label: 'Daily at Midnight', val: '0 0 * * *' },
                { label: 'Every Monday', val: '0 0 * * 1' },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setCronExpression(preset.val)}
                  className="text-[10px] font-mono border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-2 py-1 rounded-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Next Executions</label>
            <select
              value={upcomingCount}
              onChange={(e) => setUpcomingCount(Number(e.target.value))}
              className="text-[10px] font-mono text-slate-600 border border-slate-200 bg-white rounded-sm px-2 py-1 focus:outline-none focus:border-indigo-400 shadow-none cursor-pointer"
            >
              <option value={5}>Next 5</option>
              <option value={10}>Next 10</option>
              <option value={20}>Next 20</option>
            </select>
          </div>
          
          {!cronExpression.trim() && (
            <div className="h-[400px] border-2 border-dashed border-slate-300 rounded-sm p-8 text-center bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">more_time</span>
              <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Awaiting Schedule Query.</p>
            </div>
          )}

          {result && !result.isValid && cronExpression.trim() && (
            <div className="h-[400px] border border-rose-200 rounded-sm p-8 text-center bg-rose-50/50 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-rose-400 text-[40px] mb-2">error</span>
              <p className="text-sm text-rose-600 font-mono uppercase tracking-wider mb-2">Parser Error</p>
            </div>
          )}

          {result && result.isValid && (
            <div className="border border-slate-300 rounded-sm bg-white overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                {result.nextExecutions.map((exec, idx) => {
                  const d = new Date(exec);
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 border-b border-slate-100 ${idx === 0 ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-xs ${idx === 0 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="font-mono text-xs text-slate-800">
                          {d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
                        {d.toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
