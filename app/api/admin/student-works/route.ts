import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

const studentWorkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  html_content: z.string().optional(),
  summary: z.string().optional(),
  academic_year: z.number().min(2000).max(2100),
  work_type: z.enum(['project', 'competition', 'other']),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean().default(false),
  cover_image_id: z.string().uuid().optional().nullable(),
  asset_ids: z.array(z.string().uuid()).optional().default([]),
});

// GET /api/admin/student-works
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
    const year = searchParams.get('year') || '';
    const type = searchParams.get('type') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (year) {
      where.academic_year = parseInt(year);
    }

    if (type) {
      where.work_type = type;
    }

    const [works, total] = await Promise.all([
      prisma.student_works.findMany({
        where,
        orderBy: [{ academic_year: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { student_work_assets: true },
          },
        },
      }),
      prisma.student_works.count({ where }),
    ]);

    return NextResponse.json({
      works,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching student works:', error);
    return NextResponse.json({ error: 'Failed to fetch student works' }, { status: 500 });
  }
}

// POST /api/admin/student-works
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = studentWorkSchema.parse(body);
    const { cover_image_id, asset_ids, ...workData } = validated;

    // Generate slug
    let baseSlug = slugify(workData.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.student_works.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const work = await prisma.student_works.create({
      data: {
        ...workData,
        slug,
        cover_image_id: cover_image_id ?? null,
        created_by: session.user.id,
        updated_by: session.user.id,
      },
    });

    // Create asset records
    if (asset_ids && asset_ids.length > 0) {
      await prisma.student_work_assets.createMany({
        data: asset_ids.map((file_id, index) => ({
          work_id: work.id,
          file_id,
          sort_order: index,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(work, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }
    console.error('Error creating student work:', error);
    return NextResponse.json({ error: 'Failed to create student work' }, { status: 500 });
  }
}
