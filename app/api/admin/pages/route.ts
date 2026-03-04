import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';
const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  html_content: z.string().min(1, 'Content is required'),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean().default(false),
  published_at: z.string().optional(),
});

// GET /api/admin/pages
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

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.pages.findMany({
        where,
        orderBy: [{ created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pages.count({ where }),
    ]);

    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

// POST /api/admin/pages
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = pageSchema.parse(body);

    // Generate slug
    let baseSlug = slugify(validated.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.pages.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const page = await prisma.pages.create({
      data: {
        title: validated.title,
        slug,
        html_content: validated.html_content,
        meta_title: validated.meta_title || null,
        meta_description: validated.meta_description || null,
        is_published: validated.is_published,
        published_at: validated.published_at ? new Date(validated.published_at) : null,
        created_by: session.user.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
