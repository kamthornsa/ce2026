import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Lightbulb } from "lucide-react";
import { prisma } from "@/lib/db";
import { generateSEO, generateBreadcrumbSchema } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const works = await prisma.student_works.findMany({
    where: { is_published: true },
    select: { slug: true },
  });

  return works.map((work) => ({
    slug: work.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const work = await prisma.student_works.findUnique({
    where: { slug, is_published: true },
    select: {
      title: true,
      summary: true,
      meta_title: true,
      meta_description: true,
      work_type: true,
      academic_year: true,
    },
  });

  if (!work) return {};

  return generateSEO({
    title: work.meta_title || work.title,
    description:
      work.meta_description ||
      work.summary ||
      `${work.work_type.charAt(0).toUpperCase() + work.work_type.slice(1)} by Computer Engineering students (${work.academic_year})`,
    path: `/student-works/${slug}`,
  });
}

export default async function StudentWorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const work = await prisma.student_works.findUnique({
    where: { slug, is_published: true },
    include: {
      media_assets: {
        select: { file_path: true, alt_text: true },
      },
      student_work_assets: {
        orderBy: { sort_order: "asc" },
        include: {
          media_assets: true,
        },
      },
    },
  });

  if (!work) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Student Works", url: "/student-works" },
    { name: work.title, url: `/student-works/${work.slug}` },
  ]);

  return (
    <div className="py-16">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Link */}
          <Link
            href="/student-works"
            className="inline-flex items-center text-[#233dff] hover:text-[#1a2ecc] mb-8"
          >
            ← Back to Student Works
          </Link>

          <article>
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-4 py-2 bg-blue-100 text-[#233dff] font-semibold rounded-full">
                  {work.work_type.charAt(0).toUpperCase() +
                    work.work_type.slice(1)}
                </span>
                <span className="text-gray-600 font-semibold">
                  Academic Year {work.academic_year}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {work.title}
              </h1>

              {work.published_at && (
                <div className="flex items-center text-gray-600 mb-6">
                  <Calendar className="h-5 w-5 mr-2" />
                  <time>{formatDate(work.published_at)}</time>
                </div>
              )}

              {work.summary && (
                <p className="text-xl text-gray-700 leading-relaxed">
                  {work.summary}
                </p>
              )}
            </header>

            {/* Cover Image */}
            {work.media_assets?.file_path ? (
              <div className="w-full aspect-video rounded-lg mb-8 overflow-hidden">
                <img
                  src={work.media_assets.file_path}
                  alt={work.media_assets.alt_text || work.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-blue-200 to-gray-200 rounded-lg mb-8 flex items-center justify-center">
                <Lightbulb className="h-24 w-24 text-white opacity-30" />
              </div>
            )}

            {/* Content */}
            {work.html_content && (
              <div
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: work.html_content }}
              />
            )}

            {/* Gallery */}
            {work.student_work_assets.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {work.student_work_assets.map((asset, index) => (
                    <div
                      key={`${asset.work_id}-${asset.file_id}`}
                      className="space-y-2"
                    >
                      {asset.media_assets?.file_path ? (
                        <div className="w-full aspect-video rounded-lg overflow-hidden">
                          <img
                            src={asset.media_assets.file_path}
                            alt={
                              asset.caption ||
                              asset.media_assets.alt_text ||
                              `Image ${index + 1}`
                            }
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
                      )}
                      {asset.caption && (
                        <p className="text-sm text-gray-600 text-center">
                          {asset.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Works */}
            <div className="mt-12 pt-12 border-t">
              <h2 className="text-2xl font-bold mb-6">More Student Works</h2>
              <div className="text-center">
                <Link
                  href={`/student-works?year=${work.academic_year}`}
                  className="inline-flex items-center px-6 py-3 bg-[#233dff] text-white font-semibold rounded-lg hover:bg-[#1a2ecc] transition-colors"
                >
                  View {work.academic_year} Works
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
