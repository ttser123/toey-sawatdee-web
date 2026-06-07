'use client';

import React, { useMemo, useState } from 'react';
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
import { ChaosStatus } from '@/interfaces/mcp-gateway';

// Static configuration data injected from pure logic layer
import {
  TRAFFIC_NODES,
  TRAFFIC_EDGES,
  TRAFFIC_DOCS,
  PIPELINE_NODES,
  PIPELINE_EDGES,
  PIPELINE_DOCS,
  INFRA_DOCS,
  type TabDocumentation,
} from '@/lib/visualizer-datasets';

// ─── INFRASTRUCTURE MAP TAB (Top to Bottom) ─────────────────────
// Kept here due to ChaosStatus runtime binding on SG and S3 nodes.
const getInfraNodes = (status: ChaosStatus): Node[] => [
  // LAYER 1: Edge and DNS (top, wide horizontal group)
  {
    id: 'edge-group',
    data: { label: 'Edge & DNS Layer' },
    position: { x: 65, y: 0 },
    style: {
      width: 420, height: 180,
      backgroundColor: 'rgba(15, 23, 42, 0.02)',
      border: '1px dashed #cbd5e1',
      fontStyle: 'italic', borderRadius: '2px',
    },
    selectable: false, draggable: false,
  },
  {
    id: 'route53',
    position: { x: 150, y: 25 },
    data: { label: 'Route 53' },
    parentId: 'edge-group', extent: 'parent' as const,
    className: 'bg-white border border-slate-300 font-mono text-[10px] font-semibold text-slate-800 p-4 rounded-sm shadow-none',
    sourcePosition: Position.Bottom,
  },
  {
    id: 'cloudfront',
    position: { x: 150, y: 105 },
    data: { label: 'CloudFront CDN' },
    parentId: 'edge-group', extent: 'parent' as const,
    className: 'bg-white border border-slate-300 font-mono text-[10px] font-semibold text-slate-800 p-4 rounded-sm shadow-none',
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },

  // LAYER 2: VPC (middle, wide horizontal group)
  {
    id: 'net-group',
    data: { label: 'VPC Environment (10.0.0.0/16)' },
    position: { x: 65, y: 230 },
    style: {
      width: 420, height: 100,
      backgroundColor: 'rgba(99, 102, 241, 0.02)',
      border: '1px dashed #a5b4fc',
      fontStyle: 'italic', borderRadius: '2px',
    },
    selectable: false, draggable: false,
  },
  {
    id: 'sg',
    position: { x: 20, y: 35 },
    data: { label: 'Security Group' },
    parentId: 'net-group', extent: 'parent' as const,
    className: `font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none transition-all duration-300 ${
      status === 'PORT_BLOCK' || status === 'SSH_ATTACK'
        ? 'bg-rose-50 border-2 border-rose-500 text-rose-700 animate-pulse font-bold'
        : 'bg-white border border-slate-300 text-slate-800'
    }`,
    targetPosition: Position.Top, sourcePosition: Position.Right,
  },
  {
    id: 'ec2',
    position: { x: 280, y: 35 },
    data: { label: 'EC2 (Docker Host)' },
    parentId: 'net-group', extent: 'parent' as const,
    className: 'bg-indigo-50 border border-indigo-200 text-indigo-600 font-mono text-[10px] font-bold p-4 rounded-sm shadow-none',
    targetPosition: Position.Left, sourcePosition: Position.Bottom,
  },

  // LAYER 3: Storage and Auth (bottom, wide horizontal group)
  {
    id: 'back-group',
    data: { label: 'Storage & Auth' },
    position: { x: 65, y: 380 },
    style: {
      width: 420, height: 100,
      backgroundColor: 'rgba(16, 185, 129, 0.02)',
      border: '1px dashed #a7f3d0',
      fontStyle: 'italic', borderRadius: '2px',
    },
    selectable: false, draggable: false,
  },
  {
    id: 'cognito',
    position: { x: 20, y: 35 },
    data: { label: 'Cognito Auth' },
    parentId: 'back-group', extent: 'parent' as const,
    className: 'bg-white border border-slate-300 font-mono text-[10px] font-semibold text-slate-800 p-4 rounded-sm shadow-none',
    targetPosition: Position.Top,
  },
  {
    id: 's3',
    position: { x: 280, y: 35 },
    data: { label: 'S3 Assets' },
    parentId: 'back-group', extent: 'parent' as const,
    className: `font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none transition-all duration-300 ${
      status === 'S3_LEAK'
        ? 'bg-rose-50 border-2 border-rose-500 text-rose-700 animate-pulse font-bold'
        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
    }`,
    targetPosition: Position.Top,
  },
];

const INFRA_EDGES: Edge[] = [
  { id: 'e1', source: 'route53', target: 'cloudfront', type: 'straight', animated: true, style: { stroke: '#cbd5e1' } },
  { id: 'e2', source: 'cloudfront', target: 'sg', type: 'straight', style: { stroke: '#cbd5e1' } },
  { id: 'e3', source: 'sg', target: 'ec2', type: 'straight', style: { stroke: '#6366f1', strokeWidth: 1.5 } },
  { id: 'e4', source: 'ec2', target: 'cognito', type: 'straight', style: { stroke: '#cbd5e1', strokeDasharray: '4,4' } },
  { id: 'e5', source: 'ec2', target: 's3', type: 'straight', style: { stroke: '#10b981', strokeWidth: 1.5 } },
  { id: 'e6', source: 'cloudfront', target: 's3', type: 'straight', style: { stroke: '#cbd5e1', strokeDasharray: '4,4' } },
];

// Stable references to prevent ReactFlow warn #002
const nodeTypes = {};
const edgeTypes = {};

type ViewMode = 'infra' | 'traffic' | 'pipeline';

interface SystemVisualizerProps {
  currentStatus?: ChaosStatus;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function SystemVisualizer({ currentStatus = 'HEALTHY' }: SystemVisualizerProps) {
  const [mode, setMode] = useState<ViewMode>('infra');

  const nodes = useMemo(() => {
    if (mode === 'traffic') return TRAFFIC_NODES;
    if (mode === 'pipeline') return PIPELINE_NODES;
    return getInfraNodes(currentStatus);
  }, [mode, currentStatus]);

  const edges = useMemo(() => {
    if (mode === 'traffic') return TRAFFIC_EDGES;
    if (mode === 'pipeline') return PIPELINE_EDGES;
    return INFRA_EDGES;
  }, [mode]);

  const docs = useMemo((): TabDocumentation => {
    if (mode === 'traffic') return TRAFFIC_DOCS;
    if (mode === 'pipeline') return PIPELINE_DOCS;
    return INFRA_DOCS;
  }, [mode]);

  return (
    <div className="card-blueprint w-full overflow-hidden shadow-none border-slate-300 bg-white">
      {/* TACTICAL TAB BAR */}
      <div className="flex border-b border-slate-300 bg-slate-50">
        {[
          { id: 'infra', label: 'Infrastructure Map', icon: 'account_tree' },
          { id: 'traffic', label: 'Traffic Flow', icon: 'speed' },
          { id: 'pipeline', label: 'CI/CD Pipeline', icon: 'deployed_code' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as ViewMode)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[10px] font-bold uppercase tracking-wider transition-all border-r border-slate-300 last:border-r-0 ${
              mode === tab.id
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-b-indigo-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* FULL-WIDTH GRAPH CANVAS */}
      <div className="w-full relative bg-slate-50/50 h-[350px] sm:h-[450px] md:h-[600px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          draggable={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} size={1} gap={20} color="#cbd5e1" />
          <Controls showInteractive={false} className="hidden sm:flex rounded-none border border-slate-300 shadow-none fill-slate-700 bg-white" />
          
          {/* HUD Floating Title */}
          <Panel position="top-left" className="bg-white/95 backdrop-blur-sm border border-slate-300 px-3 py-1.5 font-mono text-[9px] shadow-none uppercase font-bold text-slate-800 rounded-sm flex items-center gap-2 m-2">
            <span className="material-symbols-outlined text-[12px] text-indigo-600">{docs.icon}</span>
            {docs.header}
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
