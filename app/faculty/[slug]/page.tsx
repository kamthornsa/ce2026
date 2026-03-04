import { notFound } from "next/navigation";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  generateSEO,
  generatePersonSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const faculty = await prisma.faculty.findMany({
    where: { is_published: true },
    select: { slug: true },
  });

  return faculty.map((member: { slug: string }) => ({
    slug: member.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const faculty = await prisma.faculty.findUnique({
    where: { slug, is_published: true },
    select: {
      full_name_en: true,
      meta_title: true,
      meta_description: true,
      academic_position: true,
      expertise_keywords: true,
    },
  });

  if (!faculty) return {};

  return generateSEO({
    title: faculty.meta_title || faculty.full_name_en,
    description:
      faculty.meta_description ||
      `${faculty.full_name_en}${faculty.academic_position ? `, ${faculty.academic_position}` : ""}. ${faculty.expertise_keywords || "Faculty member at Computer Engineering Department."}`,
    path: `/faculty/${slug}`,
  });
}

export default async function FacultyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const faculty = await prisma.faculty.findUnique({
    where: { slug, is_published: true },
    include: {
      media_assets: {
        select: {
          file_path: true,
        },
      },
    },
  });

  if (!faculty) {
    notFound();
  }

  // Debug: Log image data
  console.log("Faculty Image Debug:", {
    name: faculty.full_name_en,
    profile_image_id: faculty.profile_image_id,
    media_assets: faculty.media_assets,
    file_path: faculty.media_assets?.file_path,
  });

  const personSchema = generatePersonSchema(faculty);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Faculty", url: "/faculty" },
    { name: faculty.full_name_en, url: `/faculty/${faculty.slug}` },
  ]);

  return (
    <div className="py-16">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Link */}
          <a
            href="/faculty"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8"
          >
            ← Back to Faculty
          </a>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Profile Image */}
              <div className="w-full aspect-square bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg mb-6 relative overflow-hidden">
                {faculty.media_assets?.file_path ? (
                  <img
                    src={faculty.media_assets.file_path}
                    alt={faculty.full_name_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                {faculty.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${faculty.email}`}
                        className="text-purple-600 hover:underline break-all"
                      >
                        {faculty.email}
                      </a>
                    </div>
                  </div>
                )}

                {faculty.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{faculty.phone}</p>
                    </div>
                  </div>
                )}

                {faculty.office_location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Office</p>
                      <p>{faculty.office_location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* External Links */}
              {(faculty.scholar_url ||
                faculty.scopus_url ||
                faculty.researchgate_url ||
                faculty.orcid_url) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Academic Profiles</h3>
                  <div className="space-y-2">
                    {faculty.scholar_url && (
                      <a
                        href={faculty.scholar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-700 hover:text-purple-600"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Google Scholar
                      </a>
                    )}
                    {faculty.scopus_url && (
                      <a
                        href={faculty.scopus_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-700 hover:text-purple-600"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Scopus
                      </a>
                    )}
                    {faculty.researchgate_url && (
                      <a
                        href={faculty.researchgate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-700 hover:text-purple-600"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        ResearchGate
                      </a>
                    )}
                    {faculty.orcid_url && (
                      <a
                        href={faculty.orcid_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-700 hover:text-purple-600"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        ORCID
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-2">
                {faculty.full_name_en}
              </h1>
              {faculty.full_name_th && (
                <p className="text-xl text-gray-600 mb-4">
                  {faculty.full_name_th}
                </p>
              )}

              {faculty.academic_position && (
                <p className="text-lg text-purple-600 font-semibold mb-2">
                  {faculty.academic_position}
                </p>
              )}

              {faculty.job_title && (
                <p className="text-gray-600 mb-6">{faculty.job_title}</p>
              )}

              {faculty.degrees && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Education</h2>
                  <div className="prose max-w-none text-gray-700">
                    {faculty.degrees.split("\n").map((degree, idx) => (
                      <p key={idx}>{degree}</p>
                    ))}
                  </div>
                </div>
              )}

              {faculty.expertise_keywords && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">
                    Research Interests
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {faculty.expertise_keywords
                      .split(",")
                      .map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {faculty.bio_html && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Biography</h2>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: faculty.bio_html }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
