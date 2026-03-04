import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
// GET /api/admin/media
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const search = searchParams.get('search') || '';
    const mimeType = searchParams.get('mime_type') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { original_name: { contains: search, mode: 'insensitive' } },
        { alt_text: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (mimeType) {
      where.mime_type = { startsWith: mimeType };
    }

    const [media, total] = await Promise.all([
      prisma.media_assets.findMany({
        where,
        orderBy: [{ created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media_assets.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization
    type MediaItem = (typeof media)[number];
    const serializedMedia = media.map((item: MediaItem) => ({
      ...item,
      file_size_bytes: item.file_size_bytes.toString(),
    }));

    return NextResponse.json({
      media: serializedMedia,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST /api/admin/media (Upload)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const alt_text = formData.get('alt_text') as string;
    const title_text = formData.get('title_text') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${randomStr}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(filepath, buffer);

    // Get image dimensions if it's an image
    let width = null;
    let height = null;
    if (file.type.startsWith('image/')) {
      try {
        const metadata = await sharp(filepath).metadata();
        width = metadata.width || null;
        height = metadata.height || null;
      } catch (error) {
        console.error('Error getting image dimensions:', error);
      }
    }

    // Create media record
    const media = await prisma.media_assets.create({
      data: {
        file_path: `/uploads/${filename}`,
        original_name: file.name,
        mime_type: file.type,
        file_size_bytes: BigInt(file.size),
        width,
        height,
        alt_text: alt_text || null,
        title_text: title_text || null,
        metadata: {},
        created_by: session.user.id,
        created_at: new Date(),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedMedia = {
      ...media,
      file_size_bytes: media.file_size_bytes.toString(),
    };

    return NextResponse.json(serializedMedia, { status: 201 });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}
