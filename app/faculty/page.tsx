import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { generateSEO } from "@/lib/seo";
import FacultyHeader from "./FacultyHeader";

export const dynamic = "force-dynamic";

export const metadata = generateSEO({
  title: "Faculty",
  description:
    "Meet our distinguished faculty members and their areas of expertise.",
  path: "/faculty",
});

export default async function FacultyPage() {
  const faculty = await prisma.faculty.findMany({
    where: { is_published: true },
    orderBy: [{ sort_order: "asc" }, { full_name_en: "asc" }],
    select: {
      id: true,
      full_name_th: true,
      full_name_en: true,
      slug: true,
      academic_position: true,
      job_title: true,
      expertise_keywords: true,
      email: true,
      profile_image_id: true,
      media_assets: {
        select: {
          file_path: true,
        },
      },
    },
  });
  type FacultyMember = (typeof faculty)[number];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <FacultyHeader />

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculty.map((member: FacultyMember) => (
            <Link key={member.id} href={`/faculty/${member.slug}`}>
              <article className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Profile Image */}
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-purple-200 to-blue-200 group-hover:from-purple-300 group-hover:to-blue-300 transition-colors relative overflow-hidden">
                  {member.media_assets?.file_path ? (
                    <img
                      src={member.media_assets.file_path}
                      alt={member.full_name_en}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1 group-hover:text-purple-600 transition-colors">
                    {member.full_name_en}
                  </h2>
                  {member.full_name_th && (
                    <p className="text-gray-600 text-sm mb-2">
                      {member.full_name_th}
                    </p>
                  )}

                  {member.academic_position && (
                    <p className="text-purple-600 font-semibold text-sm mb-2">
                      {member.academic_position}
                    </p>
                  )}

                  {member.job_title && (
                    <p className="text-gray-600 text-sm mb-3">
                      {member.job_title}
                    </p>
                  )}

                  {member.expertise_keywords && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.expertise_keywords
                          .split(",")
                          .slice(0, 3)
                          .map((keyword: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center text-sm text-gray-600 mt-3">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {faculty.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No faculty members found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
