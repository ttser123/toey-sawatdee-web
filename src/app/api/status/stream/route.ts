import { NextResponse } from 'next/server';
import os from 'os';
import { performance } from 'perf_hooks';

export const dynamic = 'force-dynamic';

export async function GET() {
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendMetrics = () => {
        try {
          const activeMem = os.totalmem() - os.freemem();
          
          // Use performance.eventLoopUtilization if available, else fallback to 0
          const elu = typeof performance !== 'undefined' && performance.eventLoopUtilization 
            ? Math.floor(performance.eventLoopUtilization().utilization * 100) 
            : 0;

          const payload = {
            kernel: {
              uptime: os.uptime(),
              arch: os.arch(),
              cores: os.cpus().length,
              load: os.loadavg(),
              memory: { 
                active: Math.floor(activeMem / 1024 / 1024), 
                total: Math.floor(os.totalmem() / 1024 / 1024) 
              },
              diskUsage: "OK"
            },
            node: {
              version: process.version,
              heapLimit: Math.floor(process.memoryUsage().heapTotal / 1024 / 1024 || 4096),
              heapTotal: Math.floor(process.memoryUsage().heapTotal / 1024 / 1024),
              heapUsed: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024),
              elu: elu,
              lastGC: 0
            },
            fingerprint: { ip: "127.0.0.1", pop: "BKK", country: "TH", tls: "TLSv1.3" },
            egress: [{ name: "Database_Cluster", status: "UP", latency: 4 }],
            timestamp: new Date().toISOString()
          };

          // SSE Format: data: [JSON]\n\n
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err) {
          console.error("Stream compilation failed", err);
        }
      };

      // Send initial data immediately
      sendMetrics();
      
      // Push updates every 3 seconds via the persistent connection
      intervalId = setInterval(sendMetrics, 3000);
    },
    cancel() {
      // Clean up the interval when the client closes the connection
      clearInterval(intervalId);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
