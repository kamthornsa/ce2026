import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, BookOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { generateSEO, generateBreadcrumbSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Revalidate every 24 hours (ISR)
export const revalidate = 86400;

export async function generateStaticParams() {
  const programs = await prisma.programs.findMany({
    where: { is_published: true },
    select: { slug: true },
  });

  return programs.map((program) => ({
    slug: program.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const program = await prisma.programs.findUnique({
    where: { slug, is_published: true },
    select: {
      name_en: true,
      name_th: true,
      meta_title: true,
      meta_description: true,
      level: true,
    },
  });

  if (!program) return {};

  return generateSEO({
    title: program.meta_title || program.name_en,
    description:
      program.meta_description ||
      `${program.name_en} - ${program.level.charAt(0).toUpperCase() + program.level.slice(1)} degree program in Computer Engineering.`,
    path: `/academics/${slug}`,
  });
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const program = await prisma.programs.findUnique({
    where: { slug, is_published: true },
    include: {
      courses: {
        orderBy: [{ year_no: "asc" }, { term_no: "asc" }],
      },
      program_files: {
        orderBy: { sort_order: "asc" },
        include: {
          media_assets: true,
        },
      },
    },
  });

  if (!program) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Academics", url: "/academics" },
    { name: program.name_en, url: `/academics/${program.slug}` },
  ]);

  // Group courses by year and term
  const coursesByYear: Record<
    number,
    Record<number, typeof program.courses>
  > = {};
  program.courses.forEach((course) => {
    const year = course.year_no || 0;
    const term = course.term_no || 0;
    if (!coursesByYear[year]) coursesByYear[year] = {};
    if (!coursesByYear[year][term]) coursesByYear[year][term] = [];
    coursesByYear[year][term].push(course);
  });

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
            href="/academics"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8"
          >
            ← Back to Programs
          </Link>

          {/* Header */}
          <div className="mb-12">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-full mb-4">
              {program.level.charAt(0).toUpperCase() + program.level.slice(1)}{" "}
              Program
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              {program.name_en}
            </h1>
            {program.name_th && (
              <p className="text-2xl text-gray-600 mb-6">{program.name_th}</p>
            )}
          </div>

          {/* Overview */}
          {program.overview_html && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-purple-600" />
                Program Overview
              </h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: program.overview_html }}
              />
            </section>
          )}

          {/* Study Plan */}
          {program.study_plan_html && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Study Plan</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: program.study_plan_html }}
              />
            </section>
          )}

          {/* Courses */}
          {program.courses.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Curriculum</h2>
              {Object.entries(coursesByYear)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([year, terms]) => (
                  <div key={year} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-purple-600">
                      Year {year}
                    </h3>
                    {Object.entries(terms)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([term, courses]) => (
                        <div key={term} className="mb-6">
                          <h4 className="text-lg font-semibold mb-3 text-gray-700">
                            Term {term}
                          </h4>
                          <div className="space-y-2">
                            {courses.map((course) => (
                              <div
                                key={course.id}
                                className="bg-white border rounded-lg p-4 hover:border-purple-300 transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-baseline gap-3 mb-1">
                                      <span className="font-mono font-semibold text-purple-600">
                                        {course.course_code}
                                      </span>
                                      <h5 className="font-semibold">
                                        {course.course_name_en}
                                      </h5>
                                    </div>
                                    {course.course_name_th && (
                                      <p className="text-sm text-gray-600 mb-2">
                                        {course.course_name_th}
                                      </p>
                                    )}
                                    {course.description_html && (
                                      <div
                                        className="text-sm text-gray-700"
                                        dangerouslySetInnerHTML={{
                                          __html: course.description_html,
                                        }}
                                      />
                                    )}
                                  </div>
                                  {course.credits && (
                                    <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded flex-shrink-0">
                                      {course.credits.toString()} Credits
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
            </section>
          )}

          {/* Downloadable Files */}
          {program.program_files.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Downloads</h2>
              <div className="space-y-3">
                {program.program_files.map((file) => (
                  <a
                    key={file.id}
                    href={file.media_assets.file_path}
                    download
                    className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Download className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-semibold">{file.title}</p>
                        <p className="text-sm text-gray-600">
                          {file.file_type.toUpperCase()} •{" "}
                          {(
                            Number(file.media_assets.file_size_bytes) /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
