import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
const studentWorkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  html_content: z.string().optional(),
  summary: z.string().optional(),
  academic_year: z.number().min(2000).max(2100),
  work_type: z.enum(['project', 'competition', 'other']),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean(),
  cover_image_id: z.string().uuid().optional().nullable(),
});

// GET /api/admin/student-works/[id]
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

    const work = await prisma.student_works.findUnique({
      where: { id },
      include: {
        student_work_assets: {
          include: {
            media_assets: {
              select: {
                file_path: true,
                original_name: true,
              },
            },
          },
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!work) {
      return NextResponse.json({ error: 'Student work not found' }, { status: 404 });
    }

    return NextResponse.json(work);
  } catch (error) {
    console.error('Error fetching student work:', error);
    return NextResponse.json({ error: 'Failed to fetch student work' }, { status: 500 });
  }
}

// PUT /api/admin/student-works/[id]
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
    const validated = studentWorkSchema.parse(body);
    const { cover_image_id, ...workData } = validated;

    const work = await prisma.student_works.update({
      where: { id },
      data: {
        ...workData,
        cover_image_id: cover_image_id ?? null,
        updated_by: session.user.id,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(work);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }
    console.error('Error updating student work:', error);
    return NextResponse.json({ error: 'Failed to update student work' }, { status: 500 });
  }
}

// DELETE /api/admin/student-works/[id]
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

    const work = await prisma.student_works.findUnique({ where: { id } });

    if (!work) {
      return NextResponse.json({ error: 'Student work not found' }, { status: 404 });
    }

    await prisma.student_works.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student work:', error);
    return NextResponse.json({ error: 'Failed to delete student work' }, { status: 500 });
  }
}
