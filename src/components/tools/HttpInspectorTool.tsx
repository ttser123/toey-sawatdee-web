'use client';

import React from 'react';
import { useHttpInspector } from '@/hooks/useHttpInspector';

export default function HttpInspectorTool() {
  const { url, setUrl, method, setMethod, loading, result, handleInspect } = useHttpInspector();

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (status >= 300 && status < 400) return 'text-amber-500 bg-amber-50 border-amber-200';
    if (status >= 400 && status < 500) return 'text-orange-500 bg-orange-50 border-orange-200';
    if (status >= 500) return 'text-rose-500 bg-rose-50 border-rose-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  return (
    <div className="card-blueprint p-6 md:p-8 space-y-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">public</span>
          <div>
            <h2 className="text-slate-900 font-black uppercase tracking-widest text-sm">HTTP Inspector</h2>
            <p className="text-slate-400 text-xs font-mono">SYSTEM: NET_PROBE_v1</p>
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

      <form onSubmit={handleInspect} className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="md:w-32 bg-slate-100 border border-slate-300 text-slate-800 font-black font-mono rounded-sm px-4 py-3 focus:outline-none focus:border-indigo-500 shadow-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
          
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com/api/v1/health"
            className="flex-1 bg-white border border-slate-300 text-slate-900 font-mono rounded-sm px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-none"
            autoFocus
            spellCheck={false}
          />
          
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black font-mono uppercase tracking-widest px-8 py-3 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                Probe
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>

      {/* Result Area */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Status & Meta (Left Column) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Response Meta</h4>
              
              {!result.success ? (
                <div className="border border-rose-200 bg-rose-50 p-4 rounded-sm">
                  <p className="text-xs font-mono text-rose-600 break-all">{result.error}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Status</label>
                    <div className={`border px-3 py-2 rounded-sm font-mono font-black flex items-center gap-2 ${getStatusColor(result.status)}`}>
                      <span className="text-xl">{result.status}</span>
                      <span className="text-sm">{result.statusText}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Time</label>
                    <div className="border border-slate-300 bg-white px-3 py-2 rounded-sm font-mono font-bold text-slate-700 text-lg">
                      {result.timingMs} <span className="text-slate-400 text-xs">ms</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Headers & Body (Right Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {result.success && (
              <>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    Response Headers
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm">{Object.keys(result.headers).length} items</span>
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-sm overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-slate-200">
                        {Object.entries(result.headers).map(([key, value]) => (
                          <tr key={key} className="hover:bg-slate-100/50 transition-colors">
                            <td className="py-2 px-3 text-indigo-600 font-bold w-1/3 align-top break-all">{key}</td>
                            <td className="py-2 px-3 text-slate-700 break-all">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Response Body {result.isJson && <span className="text-indigo-500 ml-2">(JSON Parsed)</span>}
                  </h4>
                  <div className="bg-slate-800 border border-slate-700 rounded-sm p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blueprint opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
                    <pre className="relative z-10 text-[11px] font-mono text-emerald-400 whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar">
                      {result.bodySnippet || <span className="text-slate-500 italic">{'<Empty Body>'}</span>}
                    </pre>
                  </div>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="h-[300px] border-2 border-dashed border-slate-300 rounded-sm p-8 text-center bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
          <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">radar</span>
          <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Awaiting Target URL.</p>
        </div>
      )}
    </div>
  );
}
