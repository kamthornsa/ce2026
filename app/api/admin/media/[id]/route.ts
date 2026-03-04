import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { unlink } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
const mediaSchema = z.object({
  alt_text: z.string().optional(),
  title_text: z.string().optional(),
});

// GET /api/admin/media/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const media = await prisma.media_assets.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Convert BigInt to string for JSON serialization
    const serializedMedia = {
      ...media,
      file_size_bytes: media.file_size_bytes.toString(),
    };

    return NextResponse.json(serializedMedia);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// PUT /api/admin/media/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = mediaSchema.parse(body);

    const media = await prisma.media_assets.update({
      where: { id },
      data: {
        alt_text: validated.alt_text || null,
        title_text: validated.title_text || null,
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedMedia = {
      ...media,
      file_size_bytes: media.file_size_bytes.toString(),
    };

    return NextResponse.json(serializedMedia);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error updating media:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

// DELETE /api/admin/media/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get media to check usage
    const media = await prisma.media_assets.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            faculty: true,
            program_files: true,
            pages: true,
            posts: true,
            student_work_assets: true,
            student_works: true,
          },
        },
      },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check if media is in use
    const usageCount =
      media._count.faculty +
      media._count.program_files +
      media._count.pages +
      media._count.posts +
      media._count.student_work_assets +
      media._count.student_works;

    if (usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete media that is in use' },
        { status: 400 }
      );
    }

    // Delete file from filesystem
    try {
      const filepath = path.join(process.cwd(), 'public', media.file_path);
      await unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }

    // Delete from database
    await prisma.media_assets.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
