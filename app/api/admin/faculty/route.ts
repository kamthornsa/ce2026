import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';
const facultySchema = z.object({
  full_name_th: z.string().optional().nullable(),
  full_name_en: z.string().min(1, 'English name is required'),
  academic_position: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  degrees: z.string().optional().nullable(),
  expertise_keywords: z.string().optional().nullable(),
  bio_html: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  office_location: z.string().optional().nullable(),
  profile_image_id: z.string().uuid().optional().nullable().or(z.literal('')),
  scholar_url: z.string().url().optional().nullable().or(z.literal('')),
  scopus_url: z.string().url().optional().nullable().or(z.literal('')),
  researchgate_url: z.string().url().optional().nullable().or(z.literal('')),
  orcid_url: z.string().url().optional().nullable().or(z.literal('')),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  is_published: z.boolean().default(false),
  sort_order: z.number().default(0),
});

// GET - List all faculty
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  const where = search
    ? {
        OR: [
          { full_name_en: { contains: search, mode: 'insensitive' as const } },
          { full_name_th: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [faculty, total] = await Promise.all([
    prisma.faculty.findMany({
      where,
      orderBy: [{ sort_order: 'asc' }, { full_name_en: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.faculty.count({ where }),
  ]);

  return NextResponse.json({
    data: faculty,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST - Create new faculty
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = facultySchema.parse(body);

    // Generate slug
    const baseSlug = slugify(data.full_name_en, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.faculty.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const faculty = await prisma.faculty.create({
      data: {
        ...data,
        slug,
        profile_image_id: data.profile_image_id || null,
        scholar_url: data.scholar_url || null,
        scopus_url: data.scopus_url || null,
        researchgate_url: data.researchgate_url || null,
        orcid_url: data.orcid_url || null,
        created_by: session.user.id,
      },
    });

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
