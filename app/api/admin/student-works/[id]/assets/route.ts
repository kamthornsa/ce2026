import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const assetSchema = z.object({
  file_id: z.string().uuid(),
  caption: z.string().optional().nullable(),
});

// GET /api/admin/student-works/[id]/assets
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

    const assets = await prisma.student_work_assets.findMany({
      where: { work_id: id },
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

// POST /api/admin/student-works/[id]/assets
export async function POST(
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
    const validated = assetSchema.parse(body);

    // Check if work exists
    const work = await prisma.student_works.findUnique({
      where: { id },
    });

    if (!work) {
      return NextResponse.json({ error: 'Student work not found' }, { status: 404 });
    }

    // Check if media asset exists
    const mediaAsset = await prisma.media_assets.findUnique({
      where: { id: validated.file_id },
    });

    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
    }

    // Get the highest sort_order
    const lastAsset = await prisma.student_work_assets.findFirst({
      where: { work_id: id },
      orderBy: { sort_order: 'desc' },
    });

    const nextSortOrder = (lastAsset?.sort_order ?? -1) + 1;

    // Create asset
    const asset = await prisma.student_work_assets.create({
      data: {
        work_id: id,
        file_id: validated.file_id,
        caption: validated.caption,
        sort_order: nextSortOrder,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}

// DELETE /api/admin/student-works/[id]/assets
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

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('file_id');

    if (!fileId) {
      return NextResponse.json({ error: 'file_id is required' }, { status: 400 });
    }

    await prisma.student_work_assets.delete({
      where: {
        work_id_file_id: {
          work_id: id,
          file_id: fileId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
