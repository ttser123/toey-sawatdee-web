'use client';

import React from 'react';
import { useInspectorStore } from '@/lib/inspector-store';

export default function DependencyInspector() {
  const selectedNodeData = useInspectorStore((state) => state.selectedNodeData);
  const setSelectedNode = useInspectorStore((state) => state.setSelectedNode);

  if (!selectedNodeData) {
    return (
      <div className="w-80 h-full bg-slate-50 border-l border-slate-300 p-6 flex flex-col items-center justify-center text-slate-400 font-mono text-[10px] uppercase text-center leading-relaxed">
        <div className="mb-4 opacity-20">
          <span className="material-symbols-outlined text-4xl">search_off</span>
        </div>
        [ SYSTEM IDLE ]<br />
        SELECT NODE FOR CHASSIS INSPECTION
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-white border-l border-slate-300 flex flex-col font-mono text-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-300 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-slate-900 font-black text-xs uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-900 animate-pulse" />
            File Inspector
          </h3>
          <button 
            onClick={() => setSelectedNode(null)}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div className="bg-white border border-slate-300 p-2 text-[10px] text-slate-600 break-all leading-relaxed uppercase shadow-sm">
          {selectedNodeData.fullPath}
        </div>
      </div>

      {/* USAGE LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Detected {selectedNodeData.lines.length} Usage(s)
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <div className="space-y-4">
          {selectedNodeData.lines.map((line, index) => (
            <div key={index} className="group flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 border border-indigo-100 shadow-[2px_2px_0px_0px_rgba(79,70,229,0.1)]">
                  Line {line}
                </span>
              </div>
              <div className="bg-slate-900 text-slate-300 p-3 text-[10px] leading-relaxed border-l-4 border-indigo-500 overflow-x-auto whitespace-pre font-mono shadow-md">
                {selectedNodeData.snippets[index]?.trim() || 'process.env.{...}'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
