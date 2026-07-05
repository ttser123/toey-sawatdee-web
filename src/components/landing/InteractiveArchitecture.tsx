'use client';

import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  BackgroundVariant,
  Position 
} from 'reactflow';
import 'reactflow/dist/style.css';

interface NodeDetail {
  id: string;
  name: string;
  type: string;
  zone: string;
  description: string;
  parameters: { key: string; val: string }[];
  terraform: string;
}

const ARCHITECTURE_DETAILS: Record<string, NodeDetail> = {
  dns: {
    id: 'dns',
    name: 'aws_route53_record.cdn',
    type: 'Amazon Route 53',
    zone: 'Zone 1: The Edge',
    description: 'Directs global traffic to the CloudFront distribution via an Alias record. Includes origin isolation to prevent public DNS leak loops.',
    parameters: [
      { key: 'Record Type', val: 'A (Alias)' },
      { key: 'Target', val: 'CloudFront Distribution' },
      { key: 'DNS SEC', val: 'Enabled' }
    ],
    terraform: `resource "aws_route53_record" "cdn" {
  zone_id = var.hosted_zone_id
  name    = "toey-sawatdee.me"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}`
  },
  acm: {
    id: 'acm',
    name: 'aws_acm_certificate.cert',
    type: 'AWS Certificate Manager (ACM)',
    zone: 'Zone 1: The Edge',
    description: 'Secures all edge connections using TLS 1.2+ certificate. Must be requested in us-east-1 to be compatible with CloudFront.',
    parameters: [
      { key: 'Algorithm', val: 'RSA 2048' },
      { key: 'Validation Method', val: 'DNS Validation' },
      { key: 'Region Requirement', val: 'us-east-1' }
    ],
    terraform: `resource "aws_acm_certificate" "cert" {
  domain_name       = "toey-sawatdee.me"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}`
  },
  cdn: {
    id: 'cdn',
    name: 'aws_cloudfront_distribution.cdn',
    type: 'Amazon CloudFront CDN',
    zone: 'Zone 1: The Edge',
    description: 'Global content delivery network caching static assets. Forwarding headers are configured for App Router compatibility.',
    parameters: [
      { key: 'Caching Policy', val: 'Managed-CachingOptimized' },
      { key: 'Min TLS version', val: 'TLSv1.2_2021' },
      { key: 'Viewer Protocol', val: 'redirect-to-https' }
    ],
    terraform: `resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = "origin.toey-sawatdee.me"
    origin_id   = "EC2Origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
    }
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "EC2Origin"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }
}`
  },
  sg: {
    id: 'sg',
    name: 'aws_security_group.web_sg',
    type: 'VPC Security Group',
    zone: 'Zone 2: Compute Core',
    description: 'Stateful firewall regulating ingress traffic to EC2. Locked exclusively to CloudFront Managed Prefix List to prevent origin bypass.',
    parameters: [
      { key: 'Port 80 Ingress', val: 'CloudFront IPs only' },
      { key: 'Port 22 SSH', val: 'Disabled (SSM Session Manager used)' },
      { key: 'Egress', val: 'All allowed (0.0.0.0/0)' }
    ],
    terraform: `resource "aws_security_group" "web_sg" {
  name        = "web-server-sg"
  description = "Lock traffic to CloudFront Prefix List"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`
  },
  ec2: {
    id: 'ec2',
    name: 'aws_instance.web_app',
    type: 'Amazon EC2 (t3.micro)',
    zone: 'Zone 2: Compute Core',
    description: 'Host compute node running a multi-stage Dockerized container of Next.js SSR. Runs without SSH keys, managed entirely via SSM Instance Profile.',
    parameters: [
      { key: 'Instance Family', val: 't3.micro (2 vCPU, 1GB RAM)' },
      { key: 'Operating System', val: 'Amazon Linux 2023' },
      { key: 'IAM Profile', val: 'AmazonSSMManagedInstanceCore' }
    ],
    terraform: `resource "aws_instance" "web_app" {
  ami                  = data.aws_ami.al2023.id
  instance_type        = "t3.micro"
  iam_instance_profile = aws_iam_instance_profile.ssm_profile.name
  user_data            = file("userdata.sh")
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "toey-sawatdee-ssr"
  }
}`
  },
  cognito: {
    id: 'cognito',
    name: 'aws_cognito_user_pool.pool',
    type: 'Amazon Cognito User Pool',
    zone: 'Zone 3: Serverless Backend',
    description: 'Administrative access control layer utilizing Secure Remote Password (SRP) protocol for zero-knowledge administrator logins.',
    parameters: [
      { key: 'Auth Protocol', val: 'SRP (Secure Remote Password)' },
      { key: 'Username Attributes', val: 'Email' },
      { key: 'MFA Requirements', val: 'SMS / TOTP Optional' }
    ],
    terraform: `resource "aws_cognito_user_pool" "pool" {
  name = "toey-sawatdee-users"

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
}`
  },
  ssm: {
    id: 'ssm',
    name: 'aws_ssm_parameter.secrets',
    type: 'AWS SSM Parameter Store',
    zone: 'Zone 4: CI/CD Automation',
    description: 'Immutable system telemetry configuration storage. Sourced dynamically during GitHub actions container restart events.',
    parameters: [
      { key: 'Parameter Type', val: 'SecureString' },
      { key: 'Encryption Key', val: 'Default KMS Key (alias/aws/ssm)' },
      { key: 'Access Boundary', val: 'Restricted IAM Instance Role' }
    ],
    terraform: `resource "aws_ssm_parameter" "secrets" {
  name        = "/deploy/github_token"
  type        = "SecureString"
  value       = var.github_token
  description = "SSM Secure Parameters for GHCR image pull auth"
}`
  },
  lambda: {
    id: 'lambda',
    name: 'aws_lambda_function.telemetry',
    type: 'AWS Lambda Microservice',
    zone: 'Zone 3: Serverless Backend',
    description: 'Decoupled, serverless telemetry aggregator capturing anonymous visitor logs and system execution metrics dynamically.',
    parameters: [
      { key: 'Runtime Environment', val: 'Python 3.12' },
      { key: 'Memory Allocated', val: '128 MB' },
      { key: 'Execution Timeout', val: '10 Seconds' }
    ],
    terraform: `resource "aws_lambda_function" "telemetry" {
  filename      = "telemetry.zip"
  function_name = "telemetry-ingest"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "python3.12"
  timeout       = 10
}`
  },
  ddb: {
    id: 'ddb',
    name: 'aws_dynamodb_table.telemetry',
    type: 'Amazon DynamoDB',
    zone: 'Zone 3: Serverless Backend',
    description: 'On-demand NoSQL database table storing raw observer statistics and telemetry tracking timelines securely.',
    parameters: [
      { key: 'Billing Mode', val: 'PAY_PER_REQUEST (Serverless)' },
      { key: 'Partition Key', val: 'timestamp (String)' },
      { key: 'Data Encryption', val: 'KMS Encrypted at rest' }
    ],
    terraform: `resource "aws_dynamodb_table" "telemetry" {
  name         = "system-telemetry"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "timestamp"

  attribute {
    name = "timestamp"
    type = "S"
  }
}`
  }
};

export function InteractiveArchitecture() {
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);

  const nodeClass = 'bg-white border border-slate-300 text-slate-800 font-mono text-[10px] font-bold p-3 rounded-sm shadow-none text-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-colors';

  const flowNodes: Node[] = [
    // ── Zone 1: Edge (Column 1) ──
    {
      id: 'acm',
      data: { label: 'ACM (SSL/TLS)' },
      position: { x: 0, y: 30 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      className: `${nodeClass} w-36`
    },
    {
      id: 'dns',
      data: { label: 'Route 53 (DNS)' },
      position: { x: 0, y: 130 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      className: `${nodeClass} w-36`
    },
    {
      id: 'cdn',
      data: { label: 'CloudFront (CDN)' },
      position: { x: 250, y: 80 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      className: `${nodeClass} w-40`
    },

    // ── Zone 2: Compute Core (Column 2) ──
    {
      id: 'sg',
      data: { label: 'Security Group' },
      position: { x: 500, y: 80 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      className: `${nodeClass} w-36`
    },
    {
      id: 'ec2',
      data: { label: 'EC2 (Docker Next.js)' },
      position: { x: 730, y: 80 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      className: `${nodeClass} w-44`
    },
    {
      id: 'ssm',
      data: { label: 'SSM Parameter Store' },
      position: { x: 600, y: 220 },
      sourcePosition: Position.Top,
      targetPosition: Position.Left,
      className: `${nodeClass} w-44`
    },
    {
      id: 'cognito',
      data: { label: 'Cognito (Identity)' },
      position: { x: 830, y: 220 },
      sourcePosition: Position.Right,
      targetPosition: Position.Top,
      className: `${nodeClass} w-40`
    },

    // ── Zone 3: Serverless Backend (Column 3) ──
    {
      id: 'lambda',
      data: { label: 'Lambda (Telemetry)' },
      position: { x: 1000, y: 80 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      className: `${nodeClass} w-40`
    },
    {
      id: 'ddb',
      data: { label: 'DynamoDB (Metrics)' },
      position: { x: 1250, y: 80 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      className: `${nodeClass} w-40`
    }
  ];

  const flowEdges: Edge[] = [
    // Main traffic flow (L→R): DNS → CDN → SG → EC2 → Lambda → DDB
    { id: 'e-dns-cdn', source: 'dns', target: 'cdn', animated: true, style: { stroke: '#bc6c25' } },
    { id: 'e-acm-cdn', source: 'acm', target: 'cdn', animated: true, style: { stroke: '#94a3b8' } },
    { id: 'e-cdn-sg', source: 'cdn', target: 'sg', animated: true, style: { stroke: '#bc6c25' } },
    { id: 'e-sg-ec2', source: 'sg', target: 'ec2', animated: true, style: { stroke: '#bc6c25' } },
    { id: 'e-ec2-lam', source: 'ec2', target: 'lambda', animated: true, style: { stroke: '#bc6c25' } },
    { id: 'e-lam-ddb', source: 'lambda', target: 'ddb', animated: true, style: { stroke: '#bc6c25' } },
    // Support: EC2 → Cognito (auth, top-down via smoothstep)
    { id: 'e-ec2-cog', source: 'ec2', target: 'cognito', type: 'smoothstep', style: { stroke: '#94a3b8' } },
    // Support: SSM → EC2 (config, bottom-up via smoothstep, dashed)
    { id: 'e-ssm-ec2', source: 'ssm', target: 'ec2', type: 'smoothstep', style: { stroke: '#94a3b8', strokeDasharray: '5,5' } }
  ];

  return (
    <section className="card-blueprint bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 space-y-6 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-slate-800">
            Interactive Architecture Infrastructure ⚒
          </h2>
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border bg-indigo-50 text-indigo-600 border-indigo-200 uppercase">
          Live Diagram
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[580px]">
        {/* Canvas Area */}
        <div className="w-full h-[400px] lg:h-[580px] lg:flex-1 border border-slate-300 rounded-sm relative overflow-hidden bg-blueprint">
          <div className="absolute top-2 left-2 z-10 bg-white/90 border border-slate-200 px-2 py-1 rounded-sm shadow-none">
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block">
              Drag to pan // Scroll to zoom // Click node to inspect
            </span>
          </div>

          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            fitView
            onNodeClick={(e, node) => {
              const details = ARCHITECTURE_DETAILS[node.id];
              if (details) setSelectedNode(details);
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Lines} color="rgba(96, 108, 56, 0.03)" size={24} />
            <Controls className="!bg-white !border-slate-300 !shadow-none !rounded-sm" />
          </ReactFlow>
        </div>

        {/* Details Panel */}
        <aside className="w-full lg:w-96 border border-slate-300 rounded-sm flex flex-col font-mono text-sm overflow-hidden bg-white/95 backdrop-blur-sm">
          {!selectedNode ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-slate-400 text-[10px] uppercase text-center leading-relaxed">
              <div className="mb-4 opacity-30">
                <span className="material-symbols-outlined text-4xl">dns</span>
              </div>
              [ SYSTEM STANDBY ]<br />
              Select any architecture node<br />
              to inspect infrastructure specs
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-1">
                  {selectedNode.zone}
                </span>
                <h3 className="text-slate-800 font-black text-sm uppercase break-all">
                  {selectedNode.name}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 block mt-1 uppercase">
                  {selectedNode.type}
                </span>
              </div>

              {/* Body info */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Telemetry Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{selectedNode.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Parameters</h4>
                  {selectedNode.parameters.map((param, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-slate-100">
                      <span className="text-slate-500 uppercase">{param.key}</span>
                      <span className="text-slate-800 font-bold uppercase">{param.val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Terraform Declaration</h4>
                  <pre className="bg-slate-900 text-slate-300 p-3 text-[9px] leading-relaxed border-l-2 border-indigo-500 overflow-x-auto whitespace-pre font-mono scrollbar-hide">
                    {selectedNode.terraform}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
