import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
const courseSchema = z.object({
  course_code: z.string().min(1, 'Course code is required'),
  course_name_en: z.string().min(1, 'Course name (English) is required'),
  course_name_th: z.string().optional(),
  credits: z.number().min(0),
  year_no: z.number().min(1).max(5),
  term_no: z.number().min(1).max(3),
  description_html: z.string().optional(),
});

// POST /api/admin/programs/[id]/courses - Add a course to a program
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
    const validated = courseSchema.parse(body);

    const course = await prisma.courses.create({
      data: {
        course_code: validated.course_code,
        course_name_en: validated.course_name_en,
        course_name_th: validated.course_name_th || null,
        credits: validated.credits,
        year_no: validated.year_no,
        term_no: validated.term_no,
        description_html: validated.description_html || null,
        program_id: id,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}

// GET /api/admin/programs/[id]/courses - Get all courses for a program
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

    const courses = await prisma.courses.findMany({
      where: { program_id: id },
      orderBy: [{ year_no: 'asc' }, { term_no: 'asc' }, { course_code: 'asc' }],
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
