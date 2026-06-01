"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  BackgroundVariant,
  Panel,
  Position
} from 'reactflow';

import 'reactflow/dist/style.css';

import { EnvNodeData } from '@/lib/env-tracker-types';
import { Badge } from '@/components/ui/Badge';
import { useInspectorStore } from '@/lib/inspector-store';
import DependencyInspector from './DependencyInspector';
import { SecurityShield } from './SecurityShield';

// 🔥 ZERO-LATENCY SNAPSHOT: Embed default telemetry directly into the bundle
import defaultEnvSnapshot from '@/data/default-env-snapshot.json';

// 🛠️ SERVERLESS ARCHITECTURE: Background Web Worker Thread (Streaming Edition)
const workerScript = `
  const envMap = new Map();
  // High-speed regex tokenizer for locating environment variables
  const regex = /process\\.env\\.([a-zA-Z0-9_]+)|process\\.env\\[['" ]([a-zA-Z0-9_]+)['" ]\\]/g;

  self.onmessage = async function(e) {
    const { type, data } = e.data;

    // 1. Accumulate and process chunks in the background RAM
    if (type === 'CHUNK') {
      for (const item of data) {
        try {
          const text = await item.file.text(); // Read securely in RAM
          if (!text.includes('process.env')) continue; // Silver bullet pre-filter

          // 🛠️ THE FIX 1: คว้านไส้ Block Comments (/*...*/) ออก แต่เหลือ \\n ไว้เพื่อให้เลขบรรทัดไม่คลาดเคลื่อน!
          const cleanText = text.replace(/\\/\\*[\\s\\S]*?\\*\\//g, (match) => match.replace(/[^\\n]/g, ''));
          const lines = cleanText.split('\\n');

          lines.forEach((lineContent, lineIdx) => {
            // 🛠️ THE FIX 2: ตัด Inline Comments (//...) ทิ้งไปจากบรรทัดนั้นๆ ซะ
            const codeOnly = lineContent.split('//')[0];
            
            let match;
            regex.lastIndex = 0; // Reset regex state
            
            // สแกนเฉพาะโค้ดคลีนๆ ที่ไม่มีคอมเมนต์หลงเหลือแล้ว
            while ((match = regex.exec(codeOnly)) !== null) {
              const keyName = match[1] || match[2];
              const lineNumber = lineIdx + 1;
              const codeSnippet = codeOnly.trim();

              if (!envMap.has(keyName)) {
                envMap.set(keyName, { 
                  id: 'env-' + keyName, 
                  keyName, 
                  totalUsages: 0, 
                  dependencies: [] 
                });
              }
              const envData = envMap.get(keyName);
              envData.totalUsages += 1;
              envData.dependencies.push({ 
                filePath: item.relativePath, 
                lineNumber,
                codeSnippet
              });
            }
          });
        } catch (err) {
          // Silently skip unreadable/binary files
        }
      }
    }

    // 2. Finalize and transmit aggregated contract back to Main Thread
    if (type === 'END') {
      self.postMessage(Array.from(envMap.values()));
      envMap.clear(); // Purge RAM immediately
    }
  };
`;

export default function BlastRadiusGraph() {
  const [rawData, setRawData] = useState<EnvNodeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start in loading state
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCustomScan, setIsCustomScan] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const setSelectedNode = useInspectorStore((state) => state.setSelectedNode);

  // 🛠️ DETECT MOBILE VIEWPORT
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 🛠️ TACTICAL ARCHITECTURE: Lifecycle Management Refs
  const isMountedRef = useRef<boolean>(true);
  const activeWorkerRef = useRef<Worker | null>(null);

  // 🛠️ COMPONENT LIFECYCLE: Hard kill background tasks on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      // THE KILLER MOVE: Flip the kill switch instantly on navigation!
      isMountedRef.current = false; 
      
      if (activeWorkerRef.current) {
        activeWorkerRef.current.terminate(); // Blow up the ghost worker mid-air
        console.log("=> [Lifecycle] GHOST_WORKER_TERMINATED_SUCCESSFULLY");
      }
      
      setSelectedNode(null); // Purge Inspector state from RAM
    };
  }, [setSelectedNode]);

  // ISOMORPHIC HYDRATION: Fetch the server's own telemetry on mount
  // Falls back to embedded snapshot data if the server-side AST scan fails
  useEffect(() => {
    async function loadDefaultTelemetry() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/scan-upload'); 
        if (!res.ok) throw new Error(`INITIAL DIAGNOSTIC FAILURE [HTTP ${res.status}]`);
        
        const data = await res.json();

        // Guard: If the API returns an error object instead of an array,
        // fall back to the embedded snapshot
        if (!Array.isArray(data)) {
          throw new Error('INVALID_PAYLOAD_STRUCTURE');
        }

        if (isMountedRef.current) {
          setRawData(data);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn("Server telemetry unavailable, using embedded snapshot:", errMsg);
          // FALLBACK: Use the pre-bundled snapshot data instead of showing an error
          setRawData(defaultEnvSnapshot as EnvNodeData[]);
          setApiError(null); // Clear any error — snapshot is valid data
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }
    loadDefaultTelemetry();
  }, []);

  // 🛠️ 100% SERVERLESS + NON-BLOCKING: Stream-Chunking Architecture
  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setIsCustomScan(true);
    setApiError(null);
    setSelectedNode(null);

    // Spin up the Streaming Web Worker and register it in the Ref
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    activeWorkerRef.current = worker;

    const totalFiles = files.length;
    const BATCH_SIZE = 1000; // Process 1,000 files per UI tick to prevent freezing
    let currentIdx = 0;

    const blacklistRegex = /node_modules[\\/]|PASSWORD[\\/]|\.next[\\/]|\.git[\\/]|dist[\\/]|build[\\/]|out[\\/]|coverage[\\/]/;
    const MAX_FILE_SIZE = 250 * 1024; // 250 KB

    // 🛠️ Recursive Non-blocking Dispatcher
    const streamNextBatch = () => {
      // 🛡️ ABORT GUARD: Stop the loop instantly if user navigated away
      if (!isMountedRef.current) {
        console.log("=> [Stream] DETECTION_CANCELLED: COMPONENT_UNMOUNTED");
        return;
      }

      if (currentIdx >= totalFiles) {
        // Send final signal when all files are queued
        worker.postMessage({ type: 'END' });
        return;
      }

      const chunkToTransmit = [];
      const endIdx = Math.min(currentIdx + BATCH_SIZE, totalFiles);

      // Fast Main Thread Filter loop (Only covers 1000 items per tick)
      for (let i = currentIdx; i < endIdx; i++) {
        const file = files[i];
        const path = file.webkitRelativePath || file.name;
        
        const isBlacklisted = blacklistRegex.test(path);
        const isCodeFile = path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js');
        const isSizeOk = file.size <= MAX_FILE_SIZE;

        if (isCodeFile && !isBlacklisted && isSizeOk) {
          chunkToTransmit.push({
            file: file,
            relativePath: path
          });
        }
      }

      currentIdx = endIdx;

      // Dispatch payload chunk across the Thread Boundary
      if (chunkToTransmit.length > 0) {
        worker.postMessage({ type: 'CHUNK', data: chunkToTransmit });
      }

      // 🛠️ Yield control back to Browser UI, but check abort flag first
      if (isMountedRef.current) {
        setTimeout(streamNextBatch, 0);
      }
    };

    // Listen for the final aggregated result
    worker.onmessage = (e) => {
      if (isMountedRef.current) {
        const data = e.data;
        if (data.length === 0) {
          console.log("=> SCAN_COMPLETE: NO_VALID_ENVIRONMENT_VARIABLES_FOUND");
        }
        setRawData(data);
        setIsLoading(false);
      }
      worker.terminate(); // Free system memory
      activeWorkerRef.current = null;
      event.target.value = ''; 
    };

    worker.onerror = (err) => {
      if (isMountedRef.current) {
        console.error("Local Worker Engine Failure:", err);
        setApiError("LOCAL_WORKER_CRASHED");
        setIsLoading(false);
      }
      worker.terminate();
      activeWorkerRef.current = null;
      event.target.value = ''; 
    };

    // Ignite the engine
    streamNextBatch();
  };

  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    if (rawData.length === 0) return { nodes: flowNodes, edges: flowEdges };

    // 🛠️ THE FIX 2: Explicit Y-Axis Column trackers to ensure absolute prevention of overlap
    let leftColumnY = 0;
    let rightColumnY = 0;

    // 🛠️ THE FIX 1 (PHASE 2): Tactical Color Palette for Color-Coded Telemetry matching
    const TACTICAL_COLORS = [
      '#ef4444', // Red
      '#f97316', // Orange
      '#eab308', // Yellow
      '#22c55e', // Green
      '#06b6d4', // Cyan
      '#3b82f6', // Blue
      '#8b5cf6', // Violet
      '#d946ef', // Fuchsia
      '#f43f5e', // Rose
    ];

    // 1. Create left-side nodes (Environment Variables)
    rawData.forEach((env, idx) => {
      const themeColor = TACTICAL_COLORS[idx % TACTICAL_COLORS.length];
      
      flowNodes.push({
        id: env.id,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        position: { x: isMobile ? 10 : 50, y: leftColumnY }, // Distribute cleanly vertically
        data: { 
          label: (
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] sm:text-[10px] uppercase opacity-50 font-mono">Env Var</span>
              <span className="font-bold font-mono text-[9px] sm:text-xs break-all max-w-[110px] sm:max-w-[180px]">{env.keyName}</span>
              <Badge variant="slate" className="w-fit text-[7px] sm:text-[9px] px-1.5 py-0 rounded-none border-slate-300">
                {env.totalUsages} {isMobile ? 'USAGES' : 'TOTAL USAGES'}
              </Badge>
            </div>
          ) 
        },
        style: {
          border: `2px solid ${themeColor}`, // Tactical Color outer border
          borderLeft: isMobile ? `4px solid ${themeColor}` : `6px solid ${themeColor}`, // Thick accent left border
          borderRadius: '2px', // Keep rounded-sm sharp edges
          backgroundColor: '#ffffff', // Blueprint High-contrast White
          color: '#0f172a', // Primary ink Slate-900
          padding: isMobile ? '8px 10px' : '16px',
          minWidth: isMobile ? '135px' : '200px',
          boxShadow: isMobile ? '2px 2px 0px 0px #0f172a' : '4px 4px 0px 0px #0f172a', // Blueprint Tactical Shadow
        }
      });
      leftColumnY += isMobile ? 85 : 120; // Vertically step down for the next environment node
    });

    // 2. Aggregate files across ALL environments for high-efficiency unique nodes
    const fileAggregation = new Map<string, { lines: number[], snippets: string[] }>();
    rawData.forEach(env => {
      env.dependencies.forEach(dep => {
        if (!fileAggregation.has(dep.filePath)) {
          fileAggregation.set(dep.filePath, { lines: [], snippets: [] });
        }
        const group = fileAggregation.get(dep.filePath)!;
        group.lines.push(dep.lineNumber);
        group.snippets.push(dep.codeSnippet);
      });
    });

    // 3. Create right-side nodes (Consumer Files - merged cleanly to prevent duplication)
    const filePaths = Array.from(fileAggregation.keys());
    filePaths.forEach((filePath) => {
      const consumerId = `file-${filePath}`;
      const fileName = filePath.split(/[/\\]/).pop() || 'unknown';
      const info = fileAggregation.get(filePath)!;
      
      // Smart Labeling for Next.js App Router (e.g., api/scan/route.ts -> scan/route.ts)
      const pathParts = filePath.split(/[\\/]/);
      const smartLabel = pathParts.length > 1 
        ? `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`
        : filePath;
      
      flowNodes.push({
        id: consumerId,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        position: { x: isMobile ? 190 : 500, y: rightColumnY }, // Offset cleanly horizontally & vertically using independent right Y tracker
        data: { 
          label: (
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] sm:text-[10px] uppercase opacity-50 font-mono">{isMobile ? 'Consumer' : 'Consumer File'}</span>
              <span className="text-[9px] sm:text-xs font-bold font-mono truncate max-w-[110px] sm:max-w-[180px]">{smartLabel}</span>
              <div className="flex justify-between items-center mt-0.5 sm:mt-1">
                <span className="text-[7px] sm:text-[9px] font-mono text-slate-500 uppercase">{info.lines.length} {isMobile ? 'LOC' : 'LOCATIONS'}</span>
                <span className="text-[7px] sm:text-[8px] font-mono text-slate-400">{isMobile ? 'TAP' : 'INSPECT'}</span>
              </div>
            </div>
          ),
          fullPath: filePath,
          fileName: fileName,
          lines: info.lines,
          snippets: info.snippets
        },
        style: {
          border: '1px solid #cbd5e1', // border-slate-300
          borderLeft: '4px solid #475569', // Slate accent left border
          borderRadius: '2px', // Blueprint rounded-sm
          backgroundColor: '#f8fafc', // Slate-50 background
          color: '#334155', // text-slate-700
          padding: isMobile ? '8px 10px' : '12px',
          minWidth: isMobile ? '135px' : '220px',
          cursor: 'pointer',
          boxShadow: isMobile ? '2px 2px 0px 0px rgba(0,0,0,0.05)' : undefined,
        }
      });
      rightColumnY += isMobile ? 75 : 95; // Vertically step down for the next unique consumer node
    });

    // 4. Create connections (Edges - Bezier curve with tactical colors to prevent overlapping lines)
    rawData.forEach((env, idx) => {
      const themeColor = TACTICAL_COLORS[idx % TACTICAL_COLORS.length];
      const uniqueFilesForEnv = new Set(env.dependencies.map(d => d.filePath));
      
      uniqueFilesForEnv.forEach(filePath => {
        const consumerId = `file-${filePath}`;
        flowEdges.push({
          id: `edge-${env.id}-${consumerId}`,
          source: env.id,
          target: consumerId,
          type: 'default', // 🛠️ Bezier Curves to ensure separate angles and prevent overlay
          animated: true,
          style: { 
            stroke: themeColor, // 🛠️ Color-Coded Telemetry
            strokeWidth: 2, 
            opacity: 0.6 
          },
        });
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [rawData, isMobile]);

  const fitViewOptions = useMemo(() => ({
    padding: isMobile ? 0.05 : 0.1,
    includeHiddenNodes: true,
  }), [isMobile]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.data && node.data.lines) {
      setSelectedNode({
        fileName: node.data.fileName,
        fullPath: node.data.fullPath,
        lines: node.data.lines,
        snippets: node.data.snippets
      });
    } else {
      setSelectedNode(null);
    }
  }, [setSelectedNode]);

  // Tactical Loading State
  if (isLoading) {
    return (
      <div 
        className="w-full border-2 border-slate-900 rounded-none bg-slate-50 flex flex-col items-center justify-center font-mono text-slate-900 gap-4 px-4"
        style={{ height: isMobile ? '360px' : '500px' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-slate-900 rounded-full animate-radar-ping" />
          <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] animate-pulse text-center">
            TRANSMITTING PAYLOAD TO IN-MEMORY AST ENGINE...
          </span>
        </div>
        <div className="text-[9px] text-slate-400 uppercase tracking-widest text-center">
          SECURITY PROTOCOL: ZERO DISK I/O ACTIVE
        </div>
      </div>
    );
  }

  // Tactical Error State
  if (apiError) {
    return (
      <div 
        className="w-full border-2 border-rose-400 rounded-none bg-rose-50 flex flex-col items-center justify-center font-mono text-rose-600 p-8 text-center"
        style={{ height: isMobile ? '360px' : '500px' }}
      >
        <span className="material-symbols-outlined text-4xl mb-4">emergency_home</span>
        <span className="text-sm font-black uppercase tracking-widest mb-2">CRITICAL: ENGINE FAILURE</span>
        <div className="bg-white border border-rose-200 p-4 text-[10px] text-rose-500 uppercase leading-relaxed max-w-md">
          CODE: {apiError}
          <br />
          <span className="text-slate-400 mt-2 block italic text-[9px]">
            The In-Memory Engine encountered a structural anomaly.
          </span>
        </div>
        <button 
          onClick={() => setApiError(null)}
          className="mt-6 px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors rounded-sm"
        >
          ACKNOWLEDGE AND RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full border-2 border-slate-900 rounded-none relative bg-white shadow-sm">
      
      <div className="p-4 lg:p-6 border-b-2 border-slate-900 bg-slate-50 shrink-0 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-mono font-black text-[11px] lg:text-xs text-slate-800 uppercase tracking-widest">
              {isCustomScan ? 'Custom Telemetry Live Scan' : 'Live Portfolio Architecture Scope'}
            </span>
            <span className="font-mono text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-wider mt-1">
              {isLoading 
                ? 'Processing local stream via Web Worker...' 
                : isCustomScan 
                  ? `Detected ${rawData.length} Environment Variables (Live Custom Scan)` 
                  : `Detected ${rawData.length} Environment Variables (0ms Cached Render)`}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto shrink-0">
            <label className="cursor-pointer w-full sm:w-auto text-center group bg-indigo-600 hover:bg-indigo-700 text-white font-mono px-5 py-3 lg:px-6 rounded-none text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm lg:text-base">folder_open</span>
              <span>{isCustomScan ? 'SCAN ANOTHER FOLDER' : 'RUN LIVE IN-MEMORY TEST'}</span>
              <input 
                type="file" 
                className="hidden" 
                // @ts-expect-error
                webkitdirectory="true" 
                directory="true" 
                multiple 
                onChange={handleFolderUpload} 
                disabled={isLoading}
              />
            </label>
            <span className="text-[8px] lg:text-[9px] text-slate-400 font-mono uppercase tracking-widest text-right">
              {isLoading 
                ? 'Streaming local directories via Web Worker thread' 
                : isCustomScan 
                  ? 'Real-time client-side AST processing complete' 
                  : 'Zero Disk I/O static pre-compiled snapshot loaded'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full relative overflow-hidden items-stretch bg-dot-pattern">
        
        <div className="w-full lg:flex-1 relative" style={{ height: isMobile ? '360px' : '550px' }}>
          {/* Mobile hint: ReactFlow requires touch gestures */}
          <div className="absolute top-2 left-2 z-10 lg:hidden bg-white/90 border border-slate-200 px-2 py-1 rounded-sm">
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Pinch to zoom / Drag to pan</span>
          </div>
          {rawData.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="material-symbols-outlined text-4xl lg:text-6xl text-slate-200 mb-4">account_tree</span>
               <span className="font-mono text-[9px] lg:text-[10px] text-slate-400 uppercase tracking-widest bg-white/80 p-2 border border-slate-200">
                 [ ENGINE STANDBY ]
               </span>
             </div>
          ) : (
            <ReactFlow 
              nodes={nodes} 
              edges={edges} 
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={fitViewOptions}
            >
              <Background variant={BackgroundVariant.Dots} size={1} gap={20} color="#cbd5e1" />
              <Controls className="rounded-none border-2 border-slate-900 shadow-none fill-slate-900" />
              <Panel position="top-right" className="hidden sm:block bg-white border-2 border-slate-900 p-2 font-mono text-[9px] lg:text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-black">
                In-Memory AST Engine
              </Panel>
            </ReactFlow>
          )}
        </div>

        {/* INSPECTOR PANEL */}
        {/* Mobile: Full width below graph, Desktop: Fixed 320px width locking to the right */}
        {rawData.length > 0 && (
          <div className="w-full lg:w-80 border-t-2 lg:border-t-0 lg:border-l-2 border-slate-900 bg-white h-[350px] lg:h-auto flex flex-col overflow-hidden shrink-0">
            <DependencyInspector />
          </div>
        )}

      </div>      
      <SecurityShield />
    </div>
    
  );
}
