'use client';

import React from 'react';
import { useJwtTool } from '@/hooks/useJwtTool';

export default function JwtTool() {
  const { token, setToken, decoded } = useJwtTool();

  // Highlight token parts
  const renderTokenWithColors = () => {
    if (!token) return null;
    const parts = token.split('.');
    return (
      <div className="font-mono text-sm break-all">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span className={
              index === 0 ? "text-rose-600" :
              index === 1 ? "text-indigo-600" :
              "text-emerald-600"
            }>{part}</span>
            {index < parts.length - 1 && <span className="text-slate-400">.</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const getExpirationStatus = () => {
    if (!decoded || !decoded.payload || !decoded.payload.exp) return null;
    const expDate = new Date(decoded.payload.exp * 1000);
    const now = new Date();
    const isExpired = now > expDate;
    
    return {
      isExpired,
      dateString: expDate.toLocaleString(),
    };
  };

  const expStatus = getExpirationStatus();

  return (
    <div className="card-blueprint p-6 md:p-8 space-y-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">key</span>
          <div>
            <h2 className="text-slate-900 font-black uppercase tracking-widest text-sm">JWT Decoder Module</h2>
            <p className="text-slate-400 text-xs font-mono">SYSTEM: JWT_INSPECTOR_v1</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest">Encoded Token</label>
            {token && (
              <button 
                onClick={() => setToken('')}
                className="text-[10px] font-mono text-slate-400 hover:text-rose-600 uppercase tracking-wider transition-colors"
              >
                [ Clear ]
              </button>
            )}
          </div>
          
          <div className="relative">
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT (ey...) here"
              className="w-full h-[400px] bg-slate-50 border border-slate-300 rounded-sm p-4 text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none shadow-none"
              spellCheck={false}
            />
          </div>

          {token && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Token Structure Breakdown</h4>
              {renderTokenWithColors()}
            </div>
          )}
        </div>

        {/* Right Column: Output */}
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Decoded Payload</label>
          
          {!decoded && (
            <div className="h-[400px] border-2 border-dashed border-slate-300 rounded-sm p-8 text-center bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">code_blocks</span>
              <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Awaiting Token Payload.</p>
            </div>
          )}

          {decoded && !decoded.isValidStructure && (
            <div className="h-[400px] border border-rose-200 rounded-sm p-8 text-center bg-rose-50/50 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-rose-400 text-[40px] mb-2">error</span>
              <p className="text-sm text-rose-600 font-mono uppercase tracking-wider mb-2">Invalid Token</p>
              <p className="text-xs text-rose-500 font-mono">{decoded.error}</p>
            </div>
          )}

          {decoded && decoded.isValidStructure && (
            <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
              {/* Header section */}
              <div className="card-blueprint border-l-4 border-l-rose-500 bg-white/80 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Header (Algorithm & Type)</h4>
                  <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-100 uppercase">Part 1</span>
                </div>
                <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-slate-50 p-3 rounded-sm border border-slate-200">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>

              {/* Payload section */}
              <div className="card-blueprint border-l-4 border-l-indigo-500 bg-white/80 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payload (Data & Claims)</h4>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100 uppercase">Part 2</span>
                </div>
                
                {expStatus && (
                  <div className={`mb-3 p-2 rounded-sm border flex items-start gap-2 ${expStatus.isExpired ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <span className="material-symbols-outlined text-sm mt-0.5">
                      {expStatus.isExpired ? 'timer_off' : 'timer'}
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider">{expStatus.isExpired ? 'Token Expired' : 'Token Valid'}</p>
                      <p className="text-xs font-mono">Expires: {expStatus.dateString}</p>
                    </div>
                  </div>
                )}

                <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-slate-50 p-3 rounded-sm border border-slate-200">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>

              {/* Signature section */}
              <div className="card-blueprint border-l-4 border-l-emerald-500 bg-white/80 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signature (Verify)</h4>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100 uppercase">Part 3</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-sm border border-slate-200">
                  <p className="text-xs font-mono text-slate-600 break-all">{decoded.signature}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
