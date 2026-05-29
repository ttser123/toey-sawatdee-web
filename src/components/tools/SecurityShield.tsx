import React from 'react';

export function SecurityShield() {
  const securitySpecs = [
    {
      title: "100% LOCAL-FIRST PROCESSING",
      desc: "All source code and repository files are read as raw text and analyzed entirely inside your browser sandbox. Zero network footprint—no bytes are ever transmitted to an external server."
    },
    {
      title: "EPHEMERAL IN-MEMORY AST",
      desc: "The AST scanning engine operates in strict isolation within a client-side Web Worker thread. Data resides temporarily in volatile memory (RAM) and is instantly purged upon process completion or component unmount."
    },
    {
      title: "DETERMINISTIC TOKEN MATCHING",
      desc: "The tokenizer executes literal string and regex matching strictly for 'process.env' patterns. It does not store, log, or evaluate your application's business logic, ensuring absolute immunity against source code ingestion."
    }
  ];

  return (
    <div className="w-full mt-0 border-b-2 border-slate-900 bg-slate-950/5 p-4 lg:p-6 font-mono selection:bg-indigo-500 selection:text-white shrink-0">
      {/* SECURITY CONTROLS MONITOR HEADER */}
      <div className="flex items-center gap-2 border-b-2 border-slate-900/10 pb-3 mb-4">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
          SECURITY & DATA PRIVACY PROTOCOLS • ACTIVE VERIFIED
        </h4>
      </div>

      {/* COMPONENT SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {securitySpecs.map((spec, idx) => (
          <div key={idx} className="flex flex-col border-l-2 border-slate-300 pl-4 py-1">
            <span className="text-[9px] font-black text-slate-800 tracking-widest mb-1.5 uppercase">
              &gt;&gt; {spec.title}
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
              {spec.desc}
            </p>
          </div>
        ))}
      </div>

      {/* FOOTER AUDIT STAMP */}
      <div className="mt-4 pt-3 border-t-2 border-slate-900/10 text-center">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
          Data Privacy Compliant • Sourced via Isolated Client-Side Web Workers [No Disk I/O]
        </p>
      </div>
    </div>
  );
}
