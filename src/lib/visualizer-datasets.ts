// src/lib/visualizer-datasets.ts
// Pure static configuration data — no React dependencies.
// Layout direction: TOP to BOTTOM for all tabs.
import { Node, Edge, Position, MarkerType } from 'reactflow';

// ─── DOCUMENTATION TYPES ────────────────────────────────────────

export interface LayerDoc {
  id: string;
  title: string;
  description: string;
  services: string[];
  accentColor: string;
}

export interface TabDocumentation {
  header: string;
  moduleId: string;
  icon: string;
  layers: LayerDoc[];
}

// ─── TRAFFIC FLOW TAB ───────────────────────────────────────────
// Flow: User -> CloudFront -> (EC2 | S3) -> Cognito
// Direction: vertical top-to-bottom

export const TRAFFIC_NODES: Node[] = [
  {
    id: 'edge-group-traffic',
    data: { label: 'Edge Layer' },
    position: { x: 160, y: 120 },
    style: {
      width: 220, height: 100,
      backgroundColor: 'rgba(102, 155, 188, 0.03)',
      border: '1px dashed #a4c3d7',
      fontStyle: 'italic', borderRadius: '2px',
    },
    selectable: false, draggable: false,
  },
  {
    id: 'net-group-traffic',
    data: { label: 'VPC Environment (10.0.0.0/16)' },
    position: { x: 30, y: 280 },
    style: {
      width: 220, height: 100,
      backgroundColor: 'rgba(102, 155, 188, 0.03)',
      border: '1px dashed #669bbc',
      fontStyle: 'italic', borderRadius: '2px',
    },
    selectable: false, draggable: false,
  },
  {
    id: 'back-group-traffic',
    data: { label: 'Storage & Auth' },
    position: { x: 300, y: 280 },
    style: {
      width: 220, height: 100,
      backgroundColor: 'rgba(102, 155, 188, 0.03)',
      border: '1px dashed #85afc9',
      fontStyle: 'italic', borderRadius: '2px',
    },
    selectable: false, draggable: false,
  },
  {
    id: 'user',
    data: { label: 'Global User' },
    position: { x: 200, y: 10 },
    className: 'bg-deep-space-blue-500 text-papaya-whip-500 border border-deep-space-blue-300 font-mono text-[10px] font-bold p-4 rounded-sm shadow-none',
    sourcePosition: Position.Bottom,
  },
  {
    id: 'cf-edge',
    data: { label: 'CloudFront CDN' },
    position: { x: 30, y: 35 },
    parentId: 'edge-group-traffic', extent: 'parent' as const,
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },
  {
    id: 'ec2-origin',
    data: { label: 'EC2 Next.js App' },
    position: { x: 30, y: 35 },
    parentId: 'net-group-traffic', extent: 'parent' as const,
    className: 'bg-papaya-whip-500 border border-deep-space-blue-500 text-deep-space-blue-100 font-mono text-[10px] font-bold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },
  {
    id: 's3-origin',
    data: { label: 'S3 Asset Origin' },
    position: { x: 30, y: 35 },
    parentId: 'back-group-traffic', extent: 'parent' as const,
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top,
  },
  {
    id: 'cognito',
    data: { label: 'Cognito Auth' },
    position: { x: 160, y: 440 },
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top,
  },
];

export const TRAFFIC_EDGES: Edge[] = [
  {
    id: 't1', source: 'user', target: 'cf-edge', type: 'straight', animated: true,
    label: 'HTTPS (toey-sawatdee.me)',
    labelStyle: { fontFamily: 'monospace', fontSize: 8, fill: '#669bbc', fontWeight: 'bold' },
    style: { stroke: '#669bbc', strokeWidth: 2 },
  },
  {
    id: 't2', source: 'cf-edge', target: 's3-origin', type: 'straight', animated: true,
    label: 'Assets (/assets/*)',
    labelStyle: { fontFamily: 'monospace', fontSize: 8, fill: '#85afc9', fontWeight: 'bold' },
    style: { stroke: '#85afc9', strokeWidth: 1.5 },
  },
  {
    id: 't3', source: 'cf-edge', target: 'ec2-origin', type: 'straight', animated: true,
    label: 'Default Route',
    labelStyle: { fontFamily: 'monospace', fontSize: 8, fill: '#669bbc', fontWeight: 'bold' },
    style: { stroke: '#669bbc', strokeWidth: 1.5 },
  },
  {
    id: 't4', source: 'ec2-origin', target: 'cognito', type: 'straight', animated: true,
    label: 'User Verification',
    labelStyle: { fontFamily: 'monospace', fontSize: 8, fill: '#85afc9', fontWeight: 'bold' },
    style: { stroke: '#85afc9', strokeDasharray: '4,4' },
  },
];

export const TRAFFIC_DOCS: TabDocumentation = {
  header: 'TRAFFIC ANALYSIS',
  moduleId: 'MOD-TRAFFIC-01',
  icon: 'route',
  layers: [
    {
      id: 'ingress',
      title: 'INGRESS PATH',
      description: 'Users connect via HTTPS to toey-sawatdee.me. Route 53 resolves the domain to the nearest CloudFront edge location for minimum latency delivery.',
      services: ['Global User', 'CloudFront CDN'],
      accentColor: '#94a3b8',
    },
    {
      id: 'origin-routing',
      title: 'ORIGIN ROUTING',
      description: 'CloudFront evaluates path-based cache behaviors. Requests matching /assets/* route directly to S3 origin bucket. All remaining traffic forwards to EC2 application origin on port 3000.',
      services: ['EC2 Next.js App', 'S3 Asset Origin'],
      accentColor: '#818cf8',
    },
    {
      id: 'auth-verify',
      title: 'AUTH VERIFICATION',
      description: 'Protected routes trigger Cognito User Pool verification. The application validates JWT tokens against the Cognito authorization endpoint before granting access.',
      services: ['Cognito Auth'],
      accentColor: '#34d399',
    },
  ],
};

// ─── CI/CD PIPELINE TAB ─────────────────────────────────────────
// Flow: GitHub Push -> Actions -> (GHCR + S3) -> EC2 Deploy -> CDN Invalidate
// Direction: vertical top-to-bottom

export const PIPELINE_NODES: Node[] = [
  {
    id: 'github',
    data: { label: 'GitHub Push (main)' },
    position: { x: 200, y: 0 },
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    sourcePosition: Position.Bottom,
  },
  {
    id: 'actions',
    data: { label: 'GitHub Actions' },
    position: { x: 200, y: 100 },
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },
  {
    id: 'ghcr',
    data: { label: 'GitHub Registry (GHCR)' },
    position: { x: 50, y: 220 },
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },
  {
    id: 's3',
    data: { label: 'Sync Assets to S3' },
    position: { x: 370, y: 220 },
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },
  {
    id: 'ec2-ssm',
    data: { label: 'EC2 Deploy (AWS SSM)' },
    position: { x: 200, y: 340 },
    className: 'bg-papaya-whip-500 border border-deep-space-blue-500 text-deep-space-blue-100 font-mono text-[10px] font-bold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top, sourcePosition: Position.Bottom,
  },
  {
    id: 'cf-invalidate',
    data: { label: 'Invalidate CDN Cache' },
    position: { x: 200, y: 450 },
    className: 'bg-white border border-deep-space-blue-300 text-deep-space-blue-200 font-mono text-[10px] font-semibold p-4 rounded-sm shadow-none',
    targetPosition: Position.Top,
  },
];

export const PIPELINE_EDGES: Edge[] = [
  {
    id: 'p1', source: 'github', target: 'actions', type: 'straight', animated: true,
    style: { stroke: '#669bbc' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#669bbc' },
  },
  {
    id: 'p2', source: 'actions', target: 'ghcr', type: 'straight', animated: true,
    label: 'Build & Push',
    labelStyle: { fontFamily: 'monospace', fontSize: 8, fill: '#669bbc', fontWeight: 'bold' },
    style: { stroke: '#669bbc' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#669bbc' },
  },
  {
    id: 'p3', source: 'actions', target: 's3', type: 'straight', animated: true,
    label: 'Asset Sync',
    labelStyle: { fontFamily: 'monospace', fontSize: 8, fill: '#85afc9', fontWeight: 'bold' },
    style: { stroke: '#85afc9' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#85afc9' },
  },
  {
    id: 'p4', source: 'ghcr', target: 'ec2-ssm', type: 'straight', animated: true,
    label: 'Docker Pull',
    labelStyle: { fontFamily: 'monospace', fontSize: 8, fill: '#669bbc' },
    style: { stroke: '#669bbc', strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#669bbc' },
  },
  {
    id: 'p5', source: 'ec2-ssm', target: 'cf-invalidate', type: 'straight', animated: true,
    style: { stroke: '#669bbc' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#669bbc' },
  },
  {
    id: 'p6', source: 's3', target: 'cf-invalidate', type: 'straight', animated: true,
    style: { stroke: '#669bbc' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#669bbc' },
  },
];

export const PIPELINE_DOCS: TabDocumentation = {
  header: 'DEPLOYMENT PIPELINE',
  moduleId: 'MOD-CICD-01',
  icon: 'deployed_code_history',
  layers: [
    {
      id: 'trigger',
      title: 'STAGE 1: SOURCE TRIGGER',
      description: 'Push event on main branch triggers the GitHub Actions CI/CD workflow. Runner provisions an Ubuntu environment with Node.js 22 and Docker buildx tools.',
      services: ['GitHub Push (main)', 'GitHub Actions'],
      accentColor: '#94a3b8',
    },
    {
      id: 'build-distribute',
      title: 'STAGE 2: BUILD AND DISTRIBUTE',
      description: 'Parallel build phase. Docker image assembled and pushed to GitHub Container Registry (GHCR). Static assets from /public directory synced to S3 bucket via AWS CLI.',
      services: ['GHCR', 'S3 Sync'],
      accentColor: '#818cf8',
    },
    {
      id: 'deploy-propagate',
      title: 'STAGE 3: DEPLOY AND PROPAGATE',
      description: 'AWS SSM SendCommand instructs EC2 to pull the latest Docker image and restart the container. CloudFront cache invalidation (/*) ensures immediate global content refresh.',
      services: ['EC2 SSM Deploy', 'CDN Invalidate'],
      accentColor: '#34d399',
    },
  ],
};

// ─── INFRASTRUCTURE MAP DOCUMENTATION ───────────────────────────
// (Nodes for this tab live in SystemVisualizer.tsx due to ChaosStatus binding)

export const INFRA_DOCS: TabDocumentation = {
  header: 'ARCHITECTURE OVERVIEW',
  moduleId: 'MOD-INFRA-01',
  icon: 'hub',
  layers: [
    {
      id: 'edge-dns',
      title: 'LAYER 1: EDGE AND DNS',
      description: 'Inbound traffic enters through Route 53 for DNS resolution, then routes to CloudFront CDN for TLS termination, edge caching, and global distribution across 400+ edge locations.',
      services: ['Route 53', 'CloudFront CDN'],
      accentColor: '#94a3b8',
    },
    {
      id: 'network-compute',
      title: 'LAYER 2: NETWORK AND COMPUTE',
      description: 'Requests penetrate VPC boundary (10.0.0.0/16) via Security Group firewall rules on ports 80, 443, and 3000. Traffic reaches EC2 instance running the Dockerized Next.js application.',
      services: ['Security Group', 'EC2 Docker Host'],
      accentColor: '#818cf8',
    },
    {
      id: 'persistence-auth',
      title: 'LAYER 3: PERSISTENCE AND AUTH',
      description: 'Backend data layer. Cognito User Pool manages authentication and session tokens. S3 bucket serves static assets through CloudFront Origin Access Identity with restricted bucket policy.',
      services: ['Cognito Auth', 'S3 Assets'],
      accentColor: '#34d399',
    },
  ],
};
