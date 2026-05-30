// src/app/api/admin/resume/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ── Architectural Rule ───────────────────────────────────────────────
// Force Next.js to treat this route as fully dynamic at runtime.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // 1. Try to fetch the live Last-Modified header from the public CloudFront CDN
    try {
      const host = req.headers.get('host') || 'toey-sawatdee.me';
      // In local dev, fetch via http, otherwise https
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
      const resumeUrl = `${protocol}://${host}/assets/resume.pdf`;

      console.log(`=> [API Status] Querying HTTP HEAD of: ${resumeUrl}`);
      const response = await fetch(resumeUrl, {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const lastModifiedHeader = response.headers.get('last-modified');
      if (lastModifiedHeader) {
        const formattedDate = new Date(lastModifiedHeader).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        console.log(`=> [API Status Success] Live last modified date: ${formattedDate} UTC`);
        return NextResponse.json({ lastModified: `${formattedDate} UTC` });
      }
    } catch (fetchError) {
      console.warn('=> [API Status Warning] Failed to fetch HEAD of resume from public URL, falling back to filesystem:', fetchError);
    }

    // 2. Fallback: Read live metadata from the container's filesystem.
    const filePath = path.join(process.cwd(), 'public', 'assets', 'resume.pdf');

    if (!fs.existsSync(filePath)) {
      console.error(`=> [API Error] Resume asset not found at path: ${filePath}`);
      return NextResponse.json(
        { error: 'ASSET_NOT_FOUND', lastModified: null },
        { status: 404 }
      );
    }

    const stats = fs.statSync(filePath);

    const formattedDate = new Date(stats.mtime).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    console.log(`=> [API Status Fallback] Local file last modified date: ${formattedDate} UTC`);
    return NextResponse.json({ lastModified: `${formattedDate} UTC` });
  } catch (err) {
    console.error('=> [Critical API Failure] Failed to read resume stats:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', lastModified: null },
      { status: 500 }
    );
  }
}
