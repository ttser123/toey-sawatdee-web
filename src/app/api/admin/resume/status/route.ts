// src/app/api/admin/resume/status/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ── Architectural Rule ───────────────────────────────────────────────
// Force Next.js to treat this route as fully dynamic at runtime.
// Without these directives, Next.js App Router will pre-render (bake)
// the GET response at build time during CI/CD, causing fs.statSync
// to either read stale build-time data or fail with ENOENT in the
// standalone output where public/ may not yet exist.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Resolve the asset path relative to the standalone server root.
    // In Next.js standalone mode, process.cwd() points to the
    // directory containing server.js, where public/ must be explicitly
    // COPY'd in the Dockerfile's runner stage.
    const filePath = path.join(process.cwd(), 'public', 'assets', 'resume.pdf');

    // Guard clause: verify the file was successfully copied into the
    // Docker container. If the Dockerfile is missing the
    // `COPY --from=builder /app/public ./public` directive, this will
    // catch the ENOENT before it becomes an unhandled crash.
    if (!fs.existsSync(filePath)) {
      console.error(`=> [API Error] Resume asset not found at path: ${filePath}`);
      return NextResponse.json(
        { error: 'ASSET_NOT_FOUND', lastModified: null },
        { status: 404 }
      );
    }

    // Read live metadata from the container's filesystem.
    // NOTE: In Docker, mtime reflects the image build timestamp due to
    // COPY layer semantics, not the original file's edit date. This is
    // a known Docker limitation — the value shown is "last deployed".
    const stats = fs.statSync(filePath);

    const formattedDate = new Date(stats.mtime).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return NextResponse.json({ lastModified: `${formattedDate} UTC` });
  } catch (err) {
    console.error('=> [Critical API Failure] Failed to read resume stats:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', lastModified: null },
      { status: 500 }
    );
  }
}
