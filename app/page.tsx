import { prisma } from "@/lib/db";
import { generateSEO, generateOrganizationSchema } from "@/lib/seo";
import FocusAreas from "@/app/components/FocusAreas";
import HeroSection from "@/app/components/HeroSection";
import HomeContent from "@/app/components/HomeContent";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = generateSEO({
  title: "Computer Engineering Department",
  description:
    "Leading Computer Engineering education and research. Explore our programs, faculty, and student works.",
  path: "/",
});

export default async function Home() {
  // Fetch latest content
  const [latestNews, latestEvents, programs] = await Promise.all([
    prisma.posts.findMany({
      where: { is_published: true, type: "news" },
      orderBy: { published_at: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published_at: true,
        media_assets: {
          select: { file_path: true, alt_text: true },
        },
      },
    }),
    prisma.posts.findMany({
      where: { is_published: true, type: "event" },
      orderBy: { published_at: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published_at: true,
        event_start_at: true,
        event_end_at: true,
      },
    }),
    prisma.programs.findMany({
      where: { is_published: true },
      orderBy: { sort_order: "asc" },
      select: {
        id: true,
        name_en: true,
        slug: true,
        level: true,
      },
    }),
  ]);

  const orgSchema = generateOrganizationSchema();

  return (
    <div>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Focus Areas */}
      <FocusAreas />

      <HomeContent
        latestNews={latestNews}
        latestEvents={latestEvents}
        programs={programs}
      />
    </div>
  );
}
