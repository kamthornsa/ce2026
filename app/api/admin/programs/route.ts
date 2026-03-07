import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';
// Validation schemas
const programSchema = z.object({
  name_en: z.string().min(1, 'Name (English) is required'),
  name_th: z.string().optional(),
  level: z.enum(['bachelor', 'master', 'doctoral']),
  overview_html: z.string().optional(),
  study_plan_html: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean().default(false),
  sort_order: z.number().default(0),
  program_files: z.array(z.object({
    file_id: z.string().uuid(),
    title: z.string().min(1),
    sort_order: z.number().default(0),
  })).optional().default([]),
});

// GET /api/admin/programs - List all programs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { name_en: { contains: search, mode: 'insensitive' } },
        { name_th: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (level) {
      where.level = level;
    }

    const [programs, total] = await Promise.all([
      prisma.programs.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { name_en: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              courses: true,
              program_files: true,
            },
          },
        },
      }),
      prisma.programs.count({ where }),
    ]);

    return NextResponse.json({
      programs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}

// POST /api/admin/programs - Create a new program
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { program_files: filesData, ...programBody } = programSchema.parse(body);

    // Generate slug
    let baseSlug = slugify(programBody.name_en, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.programs.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const program = await prisma.programs.create({
      data: {
        ...programBody,
        slug,
        created_by: session.user.id,
        updated_by: session.user.id,
      },
    });

    if (filesData.length > 0) {
      await prisma.program_files.createMany({
        data: filesData.map((f) => ({
          program_id: program.id,
          file_id: f.file_id,
          title: f.title,
          sort_order: f.sort_order,
          file_type: 'pdf',
        })),
      });
    }

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
}
