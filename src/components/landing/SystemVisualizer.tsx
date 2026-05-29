'use client';

import React, { useMemo, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  BackgroundVariant,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';

// --- VISUAL DATASETS ---
// Declared as constants outside the component to ensure reference stability.

const INFRA_NODES: Node[] = [
  // EDGE LAYER
  { id: 'edge-group', data: { label: 'Edge & DNS Layer' }, position: { x: 0, y: 0 }, style: { width: 300, height: 180, backgroundColor: 'rgba(15, 23, 42, 0.02)', border: '2px dashed #cbd5e1', fontStyle: 'italic' }, selectable: false, draggable: false },
  { id: 'route53', data: { label: 'Route 53' }, position: { x: 20, y: 50 }, parentId: 'edge-group', extent: 'parent', className: 'bg-white border-2 border-slate-900 font-mono text-[10px] font-black p-4' },
  { id: 'cloudfront', data: { label: 'CloudFront' }, position: { x: 160, y: 50 }, parentId: 'edge-group', extent: 'parent', className: 'bg-white border-2 border-slate-900 font-mono text-[10px] font-black p-4' },

  // NETWORK LAYER
  { id: 'net-group', data: { label: 'VPC Environment' }, position: { x: 350, y: 0 }, style: { width: 300, height: 180, backgroundColor: 'rgba(79, 70, 229, 0.02)', border: '2px dashed #818cf8', fontStyle: 'italic' }, selectable: false, draggable: false },
  { id: 'sg', data: { label: 'Security Group' }, position: { x: 20, y: 50 }, parentId: 'net-group', extent: 'parent', className: 'bg-white border-2 border-slate-400 font-mono text-[10px] font-black p-4' },
  { id: 'ec2', data: { label: 'EC2 (Docker)' }, position: { x: 160, y: 50 }, parentId: 'net-group', extent: 'parent', className: 'bg-white border-2 border-indigo-600 font-mono text-[10px] font-black p-4 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)]' },

  // BACKEND LAYER
  { id: 'back-group', data: { label: 'Backend Services' }, position: { x: 700, y: 0 }, style: { width: 220, height: 180, backgroundColor: 'rgba(16, 185, 129, 0.02)', border: '2px dashed #6ee7b7', fontStyle: 'italic' }, selectable: false, draggable: false },
  { id: 'cognito', data: { label: 'Cognito' }, position: { x: 20, y: 35 }, parentId: 'back-group', extent: 'parent', className: 'bg-white border-2 border-emerald-500 font-mono text-[10px] font-black p-4' },
  { id: 'dynamodb', data: { label: 'DynamoDB' }, position: { x: 20, y: 95 }, parentId: 'back-group', extent: 'parent', className: 'bg-white border-2 border-emerald-500 font-mono text-[10px] font-black p-4' },
];

const INFRA_EDGES: Edge[] = [
  { id: 'e1', source: 'route53', target: 'cloudfront', animated: true, style: { stroke: '#0f172a' } },
  { id: 'e2', source: 'cloudfront', target: 'sg', style: { stroke: '#0f172a' } },
  { id: 'e3', source: 'sg', target: 'ec2', style: { stroke: '#4f46e5', strokeWidth: 2 } },
  { id: 'e4', source: 'ec2', target: 'cognito', style: { stroke: '#10b981', strokeDasharray: '5,5' } },
  { id: 'e5', source: 'ec2', target: 'dynamodb', style: { stroke: '#10b981', strokeDasharray: '5,5' } },
];

const TRAFFIC_NODES: Node[] = [
  { id: 'user', data: { label: 'Global User' }, position: { x: 0, y: 100 }, className: 'bg-slate-900 text-white border-2 border-slate-900 font-mono text-[10px] font-black p-4' },
  { id: 'cf-edge', data: { label: 'CloudFront Edge' }, position: { x: 250, y: 100 }, className: 'bg-white border-2 border-slate-900 font-mono text-[10px] font-black p-4' },
  { id: 'origin', data: { label: 'EC2 Origin (Standalone)' }, position: { x: 550, y: 100 }, className: 'bg-indigo-50 border-2 border-indigo-600 font-mono text-[10px] font-black p-4' },
  { id: 'auth', data: { label: 'Auth Check' }, position: { x: 550, y: 0 }, className: 'bg-white border-2 border-amber-500 font-mono text-[10px] font-black p-4' },
  { id: 'db', data: { label: 'Database I/O' }, position: { x: 850, y: 100 }, className: 'bg-white border-2 border-emerald-500 font-mono text-[10px] font-black p-4' },
];

const TRAFFIC_EDGES: Edge[] = [
  { id: 't1', source: 'user', target: 'cf-edge', animated: true, label: 'HTTPS/SSL', labelStyle: { fontFamily: 'monospace', fontSize: 8 }, style: { stroke: '#0f172a', strokeWidth: 3 } },
  { id: 't2', source: 'cf-edge', target: 'origin', animated: true, label: 'Origin Pull', style: { stroke: '#4f46e5', strokeWidth: 3 } },
  { id: 't3', source: 'origin', target: 'auth', animated: true, style: { stroke: '#f59e0b', strokeDasharray: '5,5' } },
  { id: 't4', source: 'origin', target: 'db', animated: true, style: { stroke: '#10b981', strokeWidth: 3 } },
];

const PIPELINE_NODES: Node[] = [
  { id: 'github', data: { label: 'GitHub Push' }, position: { x: 0, y: 50 }, className: 'bg-slate-50 border-2 border-slate-900 font-mono text-[10px] font-black p-4' },
  { id: 'action', data: { label: 'GitHub Actions' }, position: { x: 200, y: 50 }, className: 'bg-white border-2 border-slate-900 font-mono text-[10px] font-black p-4' },
  { id: 'docker', data: { label: 'Docker Build' }, position: { x: 400, y: 50 }, className: 'bg-indigo-600 text-white border-2 border-indigo-600 font-mono text-[10px] font-black p-4 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)]' },
  { id: 'ecr', data: { label: 'Push to ECR' }, position: { x: 600, y: 50 }, className: 'bg-white border-2 border-slate-900 font-mono text-[10px] font-black p-4' },
  { id: 'deploy', data: { label: 'EC2 Auto-Deploy' }, position: { x: 850, y: 50 }, className: 'bg-emerald-500 text-white border-2 border-emerald-600 font-mono text-[10px] font-black p-4' },
];

const PIPELINE_EDGES: Edge[] = [
  { id: 'p1', source: 'github', target: 'action', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'p2', source: 'action', target: 'docker', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'p3', source: 'docker', target: 'ecr', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'p4', source: 'ecr', target: 'deploy', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
];

type ViewMode = 'infra' | 'traffic' | 'pipeline';

export default function SystemVisualizer() {
  const [mode, setMode] = useState<ViewMode>('infra');

  // Strictly returning stable constants based on mode
  const nodes = useMemo(() => {
    if (mode === 'traffic') return TRAFFIC_NODES;
    if (mode === 'pipeline') return PIPELINE_NODES;
    return INFRA_NODES;
  }, [mode]);

  const edges = useMemo(() => {
    if (mode === 'traffic') return TRAFFIC_EDGES;
    if (mode === 'pipeline') return PIPELINE_EDGES;
    return INFRA_EDGES;
  }, [mode]);

  return (
    <Card className="w-full border-2 border-slate-900 rounded-none overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)]">
      {/* TACTICAL TAB BAR */}
      <div className="flex border-b-2 border-slate-900 bg-slate-50">
        {[
          { id: 'infra', label: 'Infrastructure Map', icon: 'account_tree' },
          { id: 'traffic', label: 'Traffic Flow', icon: 'speed' },
          { id: 'pipeline', label: 'CI/CD Pipeline', icon: 'deployed_code' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as ViewMode)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === tab.id 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* GRAPH CANVAS */}
      <div className="w-full relative bg-dot-pattern" style={{ height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          draggable={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background variant={BackgroundVariant.Dots} size={1} gap={20} color="#cbd5e1" />
          <Controls showInteractive={false} className="rounded-none border-2 border-slate-900 shadow-none fill-slate-900" />
          <Panel position="top-right" className="bg-white border-2 border-slate-900 p-2 font-mono text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-black">
            System Status: Active ({mode})
          </Panel>
        </ReactFlow>
      </div>
    </Card>
  );
}
