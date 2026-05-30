// src/app/api/status/stream/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import os from 'os';
import v8 from 'v8';
import { execSync } from 'child_process';
import { performance, PerformanceObserver } from 'perf_hooks';

export const dynamic = 'force-dynamic';

// Global state to track GC duration (Persistent environments like EC2)
let lastGCDuration = 0;
try {
  const obs = new PerformanceObserver((list) => {
    const entry = list.getEntries()[0];
    if (entry) lastGCDuration = entry.duration;
  });
  obs.observe({ entryTypes: ['gc'], buffered: true });
} catch {
  // PerformanceObserver might not be supported in local environments
}

interface ProbeResult {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  latency: number | null;
}

async function runProbe(name: string, url: string, parser?: (data: unknown) => 'UP' | 'DOWN' | 'DEGRADED'): Promise<ProbeResult> {
  const start = Date.now();
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 2000); // 2s timeout for real-time responsiveness

  try {
    const res = await fetch(url, { method: 'GET', signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timeout);
    const data = url.endsWith('.json') ? await res.json() : null;
    return {
      name,
      status: parser ? parser(data) : (res.ok ? 'UP' : 'DOWN'),
      latency: Date.now() - start,
    };
  } catch {
    return { name, status: 'DOWN', latency: Date.now() - start };
  }
}

export async function GET() {
  const headerList = await headers();
  const userIp = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || 'Unknown';
  const popLocation = headerList.get('x-amz-cf-pop') || 'LOCAL';
  const country = headerList.get('cloudfront-viewer-country') || 'LOCALHOST';
  const tls = headerList.get('cloudfront-viewer-tls') || 'TLS_NONE';

  const cognitoPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;

  let intervalId: NodeJS.Timeout;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendMetrics = async () => {
        try {
          // Parallel Egress Probes
          const probes = await Promise.allSettled([
            cognitoPoolId 
              ? runProbe('AWS_COGNITO', `https://cognito-idp.${cognitoPoolId.split('_')[0]}.amazonaws.com/${cognitoPoolId}/.well-known/openid-configuration`)
              : Promise.resolve({ name: 'AWS_COGNITO', status: 'UNKNOWN', latency: null }),
            runProbe('GITHUB_GLOBAL', 'https://www.githubstatus.com/api/v2/status.json', (d) => {
              const res = d as { status?: { indicator?: string } } | null;
              const ind = res?.status?.indicator;
              return ind === 'none' ? 'UP' : ind === 'minor' ? 'DEGRADED' : 'DOWN';
            }),
          ]);

          const egress = probes.map(p => p.status === 'fulfilled' ? p.value : { name: 'PROBE_ERR', status: 'DOWN', latency: null });

          // V8 Heap Stats
          const heapStats = v8.getHeapStatistics();
          const toMB = (bytes: number) => Math.floor(bytes / (1024 * 1024));
          const activeMem = os.totalmem() - os.freemem();

          // Event Loop Utilization
          const elu = typeof performance !== 'undefined' && performance.eventLoopUtilization 
            ? Math.floor(performance.eventLoopUtilization().utilization * 100) 
            : 0;

          // Disk Usage (Linux Fallback)
          let diskUsage = 'N/A';
          if (os.platform() !== 'win32') {
            try {
              diskUsage = execSync("df -h / | awk 'NR==2 {print $5}'", { timeout: 500, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
            } catch {}
          }

          const payload = {
            kernel: {
              uptime: Math.floor(os.uptime()),
              arch: os.arch(),
              cores: os.cpus().length,
              load: os.loadavg(),
              memory: { 
                active: toMB(activeMem), 
                total: toMB(os.totalmem()) 
              },
              diskUsage
            },
            node: {
              version: process.version,
              heapLimit: toMB(heapStats.heap_size_limit),
              heapTotal: toMB(heapStats.total_heap_size),
              heapUsed: toMB(heapStats.used_heap_size),
              elu: elu,
              lastGC: Math.round(lastGCDuration * 100) / 100
            },
            fingerprint: { 
              ip: userIp, 
              ua: userAgent,
              pop: popLocation, 
              country: country, 
              tls: tls 
            },
            egress,
            pipeline: {
              commit: process.env.GITHUB_SHA?.substring(0, 7) || 'dev-local',
              env: process.env.NODE_ENV || 'development',
            },
            timestamp: new Date().toISOString()
          };

          if (isClosed) return;

          // SSE Format: data: [JSON]\n\n
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err) {
          console.error("Stream compilation failed", err);
        }
      };

      // Send initial data immediately
      sendMetrics();
      
      // Push updates every 3 seconds via persistent connection
      intervalId = setInterval(sendMetrics, 3000);
    },
    cancel() {
      isClosed = true;
      // Clean up the interval when the client closes the connection
      clearInterval(intervalId);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx/CloudFront
    },
  });
}
