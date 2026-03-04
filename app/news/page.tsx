import { prisma } from "@/lib/db";
import { generateSEO } from "@/lib/seo";
import NewsContent from "./NewsContent";

export const metadata = generateSEO({
  title: "News & Events",
  description:
    "Stay updated with the latest news, announcements, and events from the Computer Engineering Department.",
  path: "/news",
});

// Revalidate every hour
export const revalidate = 3600;

interface SearchParams {
  type?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeFilter = params.type || "all";

  const where: Record<string, unknown> = { is_published: true };
  if (typeFilter !== "all") {
    where.type = typeFilter;
  }

  const posts = await prisma.posts.findMany({
    where,
    orderBy: { published_at: "desc" },
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
    },
    take: 50,
  });

  return <NewsContent posts={posts} typeFilter={typeFilter} />;
}
