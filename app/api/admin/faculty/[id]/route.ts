import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

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

// GET - Get single faculty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: {
      media_assets: {
        select: {
          file_path: true,
        },
      },
    },
  });

  if (!faculty) {
    return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
  }

  return NextResponse.json(faculty);
}

// PUT - Update faculty
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = facultySchema.parse(body);

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        ...data,
        profile_image_id: data.profile_image_id || null,
        scholar_url: data.scholar_url || null,
        scopus_url: data.scopus_url || null,
        researchgate_url: data.researchgate_url || null,
        orcid_url: data.orcid_url || null,
        updated_by: session.user.id,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(faculty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete faculty
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.faculty.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 });
  }
}
