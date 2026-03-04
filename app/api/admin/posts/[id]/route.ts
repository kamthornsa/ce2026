import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';
const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  html_content: z.string().nullish(),
  excerpt: z.string().nullish(),
  type: z.enum(['news', 'event', 'announcement']),
  thumbnail_id: z.string().uuid().nullish(),
  event_start_at: z.string().nullish(),
  event_end_at: z.string().nullish(),
  tags: z.array(z.string()).optional(),
  meta_title: z.string().nullish(),
  meta_description: z.string().nullish(),
  is_published: z.boolean(),
  published_at: z.string().nullish(),
});

// GET /api/admin/posts/[id]
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

    const post = await prisma.posts.findUnique({
      where: { id },
      include: {
        post_tags: {
          include: {
            tags: true,
          },
        },
        media_assets: {
          select: {
            id: true,
            file_path: true,
            alt_text: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT /api/admin/posts/[id]
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
    const { tags, ...postData } = body;
    const validated = postSchema.parse(body);

    // Update post
    const post = await prisma.posts.update({
      where: { id },
      data: {
        title: validated.title,
        html_content: validated.html_content || '',
        excerpt: validated.excerpt || null,
        type: validated.type,
        thumbnail_id: validated.thumbnail_id || null,
        event_start_at: validated.event_start_at ? new Date(validated.event_start_at) : null,
        event_end_at: validated.event_end_at ? new Date(validated.event_end_at) : null,
        meta_title: validated.meta_title || null,
        meta_description: validated.meta_description || null,
        is_published: validated.is_published,
        published_at: validated.published_at ? new Date(validated.published_at) : null,
        updated_by: session.user.id,
        updated_at: new Date(),
      },
    });

    // Update tags
    if (tags && Array.isArray(tags)) {
      // Delete existing tags
      await prisma.post_tags.deleteMany({
        where: { post_id: id },
      });

      // Create new tags
      if (tags.length > 0) {
        const tagRecords = await Promise.all(
          tags.map(async (tagName: string) => {
            const tag = await prisma.tags.upsert({
              where: { name: tagName },
              update: {},
              create: {
                name: tagName,
                slug: (slugify(tagName, { lower: true, strict: true }).replace(/-+/g, '-').replace(/^-+|-+$/g, '') || 'tag'),
              },
            });
            return tag;
          })
        );

        await Promise.all(
          tagRecords.map((tag) =>
            prisma.post_tags.create({
              data: {
                post_id: id,
                tag_id: tag.id,
              },
            })
          )
        );
      }
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/admin/posts/[id]
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

    // Delete post_tags first
    await prisma.post_tags.deleteMany({
      where: { post_id: id },
    });

    // Delete post
    await prisma.posts.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
