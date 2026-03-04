import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Tag, User } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  generateSEO,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Revalidate every hour (ISR)
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.posts.findMany({
    where: { is_published: true },
    select: { slug: true },
    take: 100, // Generate top 100 posts at build time
  });

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.posts.findUnique({
    where: { slug, is_published: true },
    select: {
      title: true,
      excerpt: true,
      meta_title: true,
      meta_description: true,
    },
  });

  if (!post) return {};

  return generateSEO({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || post.title,
    path: `/news/${slug}`,
    type: "article",
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.posts.findUnique({
    where: { slug, is_published: true },
    include: {
      post_tags: {
        include: {
          tags: true,
        },
      },
      media_assets: {
        select: {
          file_path: true,
          alt_text: true,
        },
      },
      users_posts_created_byTousers: {
        select: {
          full_name: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    {
      name: post.type === "event" ? "Events" : "News",
      url: `/news?type=${post.type}`,
    },
    { name: post.title, url: `/news/${post.slug}` },
  ]);

  return (
    <div className="py-16">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href={`/news?type=${post.type}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8"
          >
            ← Back to {post.type === "event" ? "Events" : "News"}
          </Link>

          <article>
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                {post.published_at && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <time>{formatDate(post.published_at)}</time>
                  </div>
                )}
                {post.users_posts_created_byTousers && (
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <span>{post.users_posts_created_byTousers.full_name}</span>
                  </div>
                )}
              </div>

              {/* Event Date Range */}
              {post.type === "event" && post.event_start_at && (
                <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-6">
                  <h3 className="font-semibold text-purple-900 mb-1">
                    Event Date
                  </h3>
                  <p className="text-purple-800">
                    {new Date(post.event_start_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {post.event_end_at &&
                      post.event_end_at !== post.event_start_at && (
                        <>
                          {" - "}
                          {new Date(post.event_end_at).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </>
                      )}
                  </p>
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-700 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* Featured Image */}
            {post.media_assets?.file_path ? (
              <img
                src={post.media_assets.file_path}
                alt={post.media_assets.alt_text || post.title}
                className="w-full aspect-video object-cover rounded-lg mb-8"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg mb-8"></div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.html_content }}
            />

            {/* Tags */}
            {post.post_tags.length > 0 && (
              <div className="border-t pt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.post_tags.map((pt) => (
                    <Link
                      key={pt.tag_id}
                      href={`/news?tag=${pt.tags.slug}`}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {pt.tags.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Related Posts */}
          <div className="mt-12 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6">
              More {post.type === "event" ? "Events" : "News"}
            </h2>
            <div className="text-center">
              <Link
                href={`/news?type=${post.type}`}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                View All {post.type === "event" ? "Events" : "News"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
