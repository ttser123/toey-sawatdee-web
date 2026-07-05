'use client';

import React from 'react';
import { useRegexTool } from '@/hooks/useRegexTool';

export default function RegexTool() {
  const { 
    pattern, setPattern, 
    flags, toggleFlag, 
    testString, setTestString, 
    evaluation 
  } = useRegexTool();

  // Highlight matches in the test string
  const renderHighlightedString = () => {
    if (!evaluation || !evaluation.isValid || evaluation.matches.length === 0) {
      return <span className="text-slate-600">{testString}</span>;
    }

    const result = [];
    let lastIndex = 0;

    evaluation.matches.forEach((m, i) => {
      // Add text before match
      if (m.index > lastIndex) {
        result.push(<span key={`text-${i}`} className="text-slate-600">{testString.substring(lastIndex, m.index)}</span>);
      }
      
      // Add highlighted match
      result.push(
        <span key={`match-${i}`} className="bg-indigo-200 text-indigo-900 border border-indigo-300 rounded-[1px] px-[1px]">
          {m.match}
        </span>
      );
      
      lastIndex = m.index + m.match.length;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      result.push(<span key="text-end" className="text-slate-600">{testString.substring(lastIndex)}</span>);
    }

    return result;
  };

  const availableFlags = [
    { id: 'g', label: 'Global', desc: 'g' },
    { id: 'i', label: 'Case Insensitive', desc: 'i' },
    { id: 'm', label: 'Multiline', desc: 'm' },
    { id: 's', label: 'Dotall', desc: 's' }
  ];

  return (
    <div className="card-blueprint p-6 md:p-8 space-y-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">regular_expression</span>
          <div>
            <h2 className="text-slate-900 font-black uppercase tracking-widest text-sm">RegEx Evaluator</h2>
            <p className="text-slate-400 text-xs font-mono">SYSTEM: PATTERN_MATCHER_v1</p>
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
        <div className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Expression</label>
            <div className="flex items-stretch gap-2">
              <div className="flex items-center px-3 bg-slate-100 border border-slate-300 text-slate-500 font-bold font-mono rounded-sm text-lg">/</div>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className={`w-full h-full bg-slate-50 border ${evaluation && !evaluation.isValid && pattern ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 text-rose-700' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-indigo-700'} rounded-sm px-4 text-lg font-mono font-bold focus:outline-none focus:ring-1 transition-colors shadow-none`}
                  spellCheck={false}
                />
              </div>
              <div className="flex items-center px-3 bg-slate-100 border border-slate-300 text-slate-500 font-bold font-mono rounded-sm text-lg">/</div>
            </div>
            
            {evaluation && !evaluation.isValid && pattern && (
              <p className="text-xs text-rose-500 font-mono mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {evaluation.error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Flags</label>
            <div className="flex flex-wrap gap-2">
              {availableFlags.map(f => (
                <button
                  key={f.id}
                  onClick={() => toggleFlag(f.id)}
                  className={`text-[10px] font-mono px-3 py-1.5 rounded-sm border uppercase transition-colors flex items-center gap-2 ${
                    flags.includes(f.id) 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-black">{f.desc}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block flex justify-between">
              Test String
              <span className="text-slate-400 font-mono font-normal normal-case">{testString.length} chars</span>
            </label>
            <div className="relative">
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="w-full h-40 bg-slate-50 border border-slate-300 rounded-sm p-4 text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none shadow-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Match Results</label>
            {evaluation && evaluation.isValid && (
              <span className="text-[10px] font-mono text-slate-500">
                Exec Time: {evaluation.executionTimeMs}ms
              </span>
            )}
          </div>

          {/* Highlight Viewer */}
          <div className="bg-white border border-slate-300 p-4 rounded-sm min-h-[120px] font-mono text-sm whitespace-pre-wrap break-all shadow-inner relative">
             {testString ? renderHighlightedString() : (
               <span className="text-slate-300 italic">Enter a test string to see matches...</span>
             )}
          </div>

          {/* Detailed Matches List */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
              Extracted Data 
              {evaluation?.isValid && (
                <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded-sm">{evaluation.matches.length} Matches</span>
              )}
            </h4>
            
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
              {!evaluation?.isValid && pattern && (
                <div className="text-center py-8 text-rose-400 font-mono text-xs uppercase">
                  Fix Regex Syntax to view extraction.
                </div>
              )}
              
              {evaluation?.isValid && evaluation.matches.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-mono text-xs uppercase">
                  No matches found.
                </div>
              )}

              {evaluation?.isValid && evaluation.matches.map((m, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Match #{idx + 1}</span>
                    <span className="text-[10px] font-mono text-slate-400">Index: {m.index}</span>
                  </div>
                  <div className="font-mono text-sm text-slate-800 bg-white border border-slate-200 p-2 rounded-sm break-all">
                    {m.match}
                  </div>
                  
                  {m.groups.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Capture Groups</span>
                      {m.groups.map((group, gIdx) => (
                        <div key={gIdx} className="flex items-start gap-2 text-xs font-mono">
                          <span className="text-slate-400">[{gIdx + 1}]</span>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded-sm break-all">{group !== undefined ? group : 'undefined'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
