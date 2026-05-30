'use client';

import { useState, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────

interface APMData {
  kernel: {
    uptime: number;
    arch: string;
    cores: number;
    load: number[];
    memory: { active: number; total: number };
    diskUsage: string;
  };
  node: {
    version: string;
    heapLimit: number;
    heapTotal: number;
    heapUsed: number;
    elu: number;
    lastGC: number;
  };
  fingerprint: {
    ip: string;
    ua: string;
    pop: string;
    country: string;
    tls: string;
  };
  egress: {
    name: string;
    status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
    latency: number | null;
  }[];
  pipeline: {
    commit: string;
    env: string;
  };
  timestamp: string;
}

interface LogEntry {
  id: string;
  time: string;
  msg: string;
  status: 'OK' | 'FAIL';
}

// ── Sub-Components ───────────────────────────────────────────────────

const CockpitSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode, className?: string }) => (
  <div className={`card-blueprint p-3 flex flex-col gap-3 ${className}`}>
    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
      <div className="flex gap-0.5">
        <div className="h-0.5 w-2 bg-slate-100" />
        <div className="h-0.5 w-0.5 bg-slate-200" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">{children}</div>
  </div>
);

const CockpitMetric = ({ label, value, sub, warning = false }: { label: string; value: string | number; sub?: string; warning?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div className="flex items-baseline gap-1 overflow-hidden">
      <span className={`text-xs font-mono font-bold truncate ${warning ? 'text-rose-500' : 'text-slate-700'}`}>{value}</span>
      {sub && <span className="text-[8px] font-mono text-slate-400 shrink-0 uppercase">{sub}</span>}
    </div>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────

export default function StatusDashboard() {
  const [data, setData] = useState<APMData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isError, setIsError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    // 🛠️ TACTICAL ARCHITECTURE: Open a persistent SSE pipeline to the backend
    const eventSource = new EventSource('/api/status/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload: APMData = JSON.parse(event.data);
        setData(payload);
        setIsError(false);
        setIsSyncing(false);

        // High-precision ID generation to prevent collisions
        const uniqueId = `ACK_${performance.now().toFixed(0)}_${Math.random().toString(36).substring(2, 7)}`;
        
        setLogs((prev) => [
          {
            id: uniqueId,
            time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            msg: `STREAM_PACKET_RECEIVED: SYNC_OK`,
            status: 'OK'
          } as LogEntry,
          ...prev
        ].slice(0, 30)); // Cap at 30 to prevent UI memory bloat on mobile
      } catch (err) {
        console.error("Failed to parse SSE payload", err);
      }
    };

    eventSource.onerror = () => {
      setIsError(true);
      setIsSyncing(false);
      setLogs((prev) => [
        {
          id: `ERR_${Date.now()}`,
          time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          msg: `STREAM_SIGNAL_DROPOUT: ATTEMPTING_RECONNECT`,
          status: 'FAIL'
        } as LogEntry,
        ...prev
      ].slice(0, 30));
    };

    // 🛠️ Cleanup: Terminate the connection when the user navigates away
    return () => {
      eventSource.close();
    };
  }, []);

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-4 pb-8 max-w-7xl mx-auto selection:bg-slate-900 selection:text-white antialiased">

      {/* ── Main HUD Header ─────────────────────────────── */}
      <div className={`flex items-center justify-between p-3 rounded-sm border transition-all duration-700 bg-white/80 backdrop-blur-md ${isError ? 'border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] bg-rose-50/30' : 'border-slate-300 shadow-sm'
        }`}>
        <div className="flex items-center gap-3">
          <div className="relative h-2 w-2">
            {!isError && <div className="absolute inset-0 bg-emerald-400 rounded-full animate-radar-ping" />}
            <div className={`relative h-2 w-2 rounded-full ${isError ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold ${isError ? 'text-rose-600' : 'text-slate-600'}`}>
              {isError ? 'CRITICAL SIGNAL LOSS' : 'ALL SYSTEMS NOMINAL'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">Telemetry Clock</span>
            <span className="text-xs font-mono font-bold text-slate-500 leading-tight">
              {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--'}
            </span>
          </div>
          {isSyncing && <div className="h-3 w-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin opacity-40" />}
        </div>
      </div>

      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-sm font-mono text-[10px] uppercase tracking-widest flex items-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-sm">warning</span>
          <span>Sectors Offline: Telemetry Signal Lost. Attempting Reconnection...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Sector: HARDWARE & KERNEL */}
        <CockpitSection title="Hardware & Kernel">
          <CockpitMetric label="CPU Clusters" value={data?.kernel.cores || '--'} sub={data?.kernel.arch} />
          <CockpitMetric label="System Uptime" value={data ? formatUptime(data.kernel.uptime) : '--'} />
          <CockpitMetric label="Memory Usage" value={data?.kernel.memory.active || '--'} sub={`/ ${data?.kernel.memory.total}MB`} />
          <CockpitMetric label="Storage (Root)" value={data?.kernel.diskUsage || 'N/A'} sub="VOL" />
          <div className="col-span-2 space-y-1">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Load Average (1m/5m/15m)</span>
            <div className="grid grid-cols-3 gap-1">
              {data?.kernel.load.map((l, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-sm py-0.5 text-center text-[10px] font-mono font-bold text-slate-600">
                  {l.toFixed(2)}
                </div>
              )) || <div className="col-span-3 text-center text-slate-200">---</div>}
            </div>
          </div>
        </CockpitSection>

        {/* Sector: NODE.JS ENGINE */}
        <CockpitSection title="Node.js Engine">
          <CockpitMetric label="Runtime Version" value={data?.node.version || '--'} />
          <CockpitMetric label="ELU utilization" value={`${data?.node.elu || 0}%`} warning={(data?.node.elu || 0) > 80} />
          <CockpitMetric label="Active Heap" value={data?.node.heapUsed || '--'} sub="MB" />
          <CockpitMetric label="Heap Limit" value={data?.node.heapLimit || '--'} sub="MB" />
          <div className="col-span-2 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Memory Pressure</span>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">Heap: {data?.node.heapTotal}MB Total</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${(data?.node.elu || 0) > 80 ? 'bg-rose-500' : 'bg-slate-900'}`}
                style={{ width: data ? `${(data.node.heapUsed / data.node.heapLimit) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Last GC Duration</span>
              <span className="text-[10px] font-mono font-bold text-slate-600">{data?.node.lastGC}ms</span>
            </div>
          </div>
        </CockpitSection>

        {/* Sector: CLIENT & EDGE */}
        <CockpitSection title="Client & Edge">
          <CockpitMetric label="Public IP" value={data?.fingerprint.ip || '---'} />
          <CockpitMetric label="POP Location" value={data?.fingerprint.pop || '---'} />
          <CockpitMetric label="Geo Country" value={data?.fingerprint.country || '---'} />
          <CockpitMetric label="TLS Version" value={data?.fingerprint.tls || '---'} />
          <div className="col-span-2">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">User Agent Header</span>
            <div className="mt-1 bg-slate-50 border border-slate-100 p-1.5 text-[9px] font-mono text-slate-400 leading-tight truncate rounded-sm">
              {data?.fingerprint.ua || '---'}
            </div>
          </div>
        </CockpitSection>

        {/* Sector: EXTERNAL EGRESS */}
        <CockpitSection title="External Egress">
          <div className="col-span-2 -mt-1">
            {data?.egress.map((svc) => (
              <div key={svc.name} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors -mx-1 px-1">
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${svc.status === 'UP' ? 'bg-emerald-500 animate-blink' : 'bg-rose-500 animate-pulse'}`} />
                  <span className="text-[10px] font-bold text-slate-600 tracking-tight">{svc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{svc.latency}ms</span>
                  <span className={`text-[8px] font-black px-1 py-0.5 rounded-sm ${svc.status === 'UP' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
            {(!data?.egress || data.egress.length === 0) && <div className="py-4 text-center text-slate-200">---</div>}
          </div>
        </CockpitSection>
      </div>

      {/* Sector: SYNC_LOG Terminal */}
      <div className="card-blueprint p-4 bg-slate-50/50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Live TelemetryLog</h3>
        <div className="h-40 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-3 py-1 bg-white/30 rounded-r-sm">
              <span className="text-slate-400 font-mono shrink-0 font-bold">{log.time}</span>
              <span className={`font-semibold ${log.status === 'OK' ? 'text-slate-600' : 'text-rose-600 font-bold'}`}>
                {log.msg}
              </span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-slate-300 italic py-2">Waiting for signal sync...</p>}
        </div>
      </div>

      {/* Cockpit Footer */}
      <div className="flex justify-between items-center px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] font-mono border border-dashed border-slate-200 bg-slate-50/30 rounded-sm">
        <div>
          ENV: <span className="text-indigo-600">{data?.pipeline.env || 'DEVELOPMENT'}</span>
        </div>
        <div>
          COMMIT: <span className="text-slate-600">{data?.pipeline.commit || 'dev-local'}</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
