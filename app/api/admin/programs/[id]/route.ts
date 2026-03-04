import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const programSchema = z.object({
  name_en: z.string().min(1, 'Name (English) is required'),
  name_th: z.string().optional(),
  level: z.enum(['bachelor', 'master', 'doctoral']),
  overview_html: z.string().optional(),
  study_plan_html: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean(),
  sort_order: z.number(),
});

// GET /api/admin/programs/[id] - Get a single program
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const program = await prisma.programs.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: [{ year_no: 'asc' }, { term_no: 'asc' }, { course_code: 'asc' }],
        },
        program_files: {
          orderBy: { sort_order: 'asc' },
          include: {
            media_assets: {
              select: {
                id: true,
                file_path: true,
                original_name: true,
                mime_type: true,
                file_size_bytes: true,
              },
            },
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const sanitized = {
      ...program,
      program_files: program.program_files.map(file => ({
        ...file,
        media_assets: file.media_assets
          ? {
              ...file.media_assets,
              file_size_bytes: file.media_assets.file_size_bytes?.toString() ?? null,
            }
          : null,
      })),
    };

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
  }
}

// PUT /api/admin/programs/[id] - Update a program
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = programSchema.parse(body);

    const program = await prisma.programs.update({
      where: { id },
      data: {
        ...validated,
        updated_by: session.user.id,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error updating program:', error);
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
  }
}

// DELETE /api/admin/programs/[id] - Delete a program
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if program has courses or files
    const program = await prisma.programs.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true, program_files: true },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (program._count.courses > 0 || program._count.program_files > 0) {
      return NextResponse.json(
        { error: 'Cannot delete program with courses or files. Delete them first.' },
        { status: 400 }
      );
    }

    await prisma.programs.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
  }
}
