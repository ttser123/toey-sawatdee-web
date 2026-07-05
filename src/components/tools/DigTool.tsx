'use client';

import React from 'react';
import { useDigTool } from '@/hooks/useDigTool';
import { DnsRecordType } from '@/app/tools/dig/actions';

const RECORD_TYPES: DnsRecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'PTR', 'SRV', 'ANY'];

export default function DigTool() {
  const {
    domain,
    setDomain,
    recordType,
    setRecordType,
    result,
    isLoading,
    handleLookup,
    handleKeyDown,
  } = useDigTool();

  return (
    <div className="card-blueprint p-6 md:p-8 space-y-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">dns</span>
          <div>
            <h2 className="text-slate-900 font-black uppercase tracking-widest text-sm">DNS Lookup Module</h2>
            <p className="text-slate-400 text-xs font-mono">SYSTEM: DIG_v1.0.0</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          ONLINE
        </span>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Target Domain</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">public</span>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-sm py-2.5 pl-9 pr-4 text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-none"
              />
            </div>
          </div>
          <div className="md:w-48 space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Record Type</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as DnsRecordType)}
              className="w-full bg-slate-50 border border-slate-300 rounded-sm py-2.5 px-3 text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-none cursor-pointer"
            >
              {RECORD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleLookup}
              disabled={isLoading || !domain.trim()}
              className="h-[42px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black tracking-widest uppercase rounded-sm transition-colors flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              ) : (
                'Lookup'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Query Results</h3>
        
        {!result && !isLoading && (
          <div className="border-2 border-dashed border-slate-300 rounded-sm p-8 text-center bg-white/60 backdrop-blur-sm">
            <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">find_in_page</span>
            <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Awaiting Target Input.</p>
          </div>
        )}

        {isLoading && (
          <div className="border-2 border-dashed border-indigo-200 rounded-sm p-8 text-center bg-indigo-50/30">
            <span className="material-symbols-outlined text-indigo-400 text-[40px] mb-2 animate-spin">radar</span>
            <p className="text-sm text-indigo-500 font-mono uppercase tracking-wider">Scanning Network...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className={`border rounded-sm p-4 ${result.success ? 'border-slate-300 bg-slate-50/50' : 'border-rose-200 bg-rose-50/50'}`}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border uppercase ${result.success ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {result.success ? 'SUCCESS' : 'ERROR'}
              </span>
              {result.timeMs !== undefined && (
                <span className="text-[10px] font-mono text-slate-500">
                  Latency: {result.timeMs}ms
                </span>
              )}
            </div>
            
            <div className="overflow-x-auto">
              {result.success ? (
                <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              ) : (
                <div className="flex items-start gap-2 text-rose-600">
                  <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                  <span className="text-xs font-mono">{result.error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
