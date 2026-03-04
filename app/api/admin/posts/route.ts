import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

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
  is_published: z.boolean().default(false),
  published_at: z.string().nullish(),
});

// GET /api/admin/posts
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
    const type = searchParams.get('type') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [posts, total] = await Promise.all([
      prisma.posts.findMany({
        where,
        orderBy: [{ created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          post_tags: {
            include: {
              tags: true,
            },
          },
        },
      }),
      prisma.posts.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/admin/posts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tags, ...postData } = body;
    const validated = postSchema.parse(body);

    // Generate slug — must match system.slug domain: ^[a-z0-9]+(?:-[a-z0-9]+)*$
    let baseSlug = slugify(validated.title, { lower: true, strict: true })
      .replace(/-+/g, '-')       // collapse consecutive hyphens
      .replace(/^-+|-+$/g, '')  // trim leading/trailing hyphens
      || 'post';                 // fallback if title produces empty slug
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.posts.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create post
    const post = await prisma.posts.create({
      data: {
        title: validated.title,
        slug,
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
        created_by: session.user.id,
        updated_by: session.user.id,
      },
    });

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagRecords = await Promise.all(
        tags.map(async (tagName: string) => {
          // Find or create tag
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

      // Create post_tags relations
      await Promise.all(
        tagRecords.map((tag) =>
          prisma.post_tags.create({
            data: {
              post_id: post.id,
              tag_id: tag.id,
            },
          })
        )
      );
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    console.error('Error creating post:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
