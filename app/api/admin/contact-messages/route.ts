import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/admin/contact-messages
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [messages, total, newCount, readCount, archivedCount] = await Promise.all([
      prisma.contact_messages.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact_messages.count({ where }),
      prisma.contact_messages.count({ where: { status: 'new' } }),
      prisma.contact_messages.count({ where: { status: 'read' } }),
      prisma.contact_messages.count({ where: { status: 'archived' } }),
    ]);

    return NextResponse.json({
      messages,
      newCount,
      statusCounts: {
        new: newCount,
        read: readCount,
        archived: archivedCount,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}
