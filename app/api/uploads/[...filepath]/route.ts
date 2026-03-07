import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filepath: string[] }> }
) {
  const { filepath } = await params;

  // Resolve and validate path to prevent directory traversal
  const resolved = path.resolve(path.join(UPLOAD_DIR, ...filepath));
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!existsSync(resolved)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const file = readFileSync(resolved);
  const ext = path.extname(resolved).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  return new NextResponse(file, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
