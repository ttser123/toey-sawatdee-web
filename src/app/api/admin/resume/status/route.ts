import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'assets', 'resume.pdf');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'FILE_NOT_FOUND' }, { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD

    return NextResponse.json({ lastModified });
  } catch (error) {
    console.error('Failed to get file status:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
