import { prisma } from "@/lib/db";
import { generateSEO } from "@/lib/seo";
import StudentWorksContent from "./StudentWorksContent";

export const dynamic = "force-dynamic";

export const metadata = generateSEO({
  title: "Student Works",
  description:
    "Explore outstanding projects and research works by our Computer Engineering students.",
  path: "/student-works",
});

interface SearchParams {
  year?: string;
  type?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function StudentWorksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const yearFilter = params.year ? parseInt(params.year) : undefined;
  const typeFilter = params.type;

  const works = await prisma.student_works.findMany({
    where: {
      is_published: true,
      ...(yearFilter && { academic_year: yearFilter }),
      ...(typeFilter && { work_type: typeFilter }),
    },
    orderBy: [{ academic_year: "desc" }, { published_at: "desc" }],
    take: 50,
    include: {
      media_assets: {
        select: { file_path: true, alt_text: true },
      },
    },
  });

  const years = await prisma.student_works.findMany({
    where: { is_published: true },
    select: { academic_year: true },
    distinct: ["academic_year"],
    orderBy: { academic_year: "desc" },
  });

  return (
    <StudentWorksContent
      works={works}
      years={years}
      yearFilter={yearFilter}
      typeFilter={typeFilter}
    />
  );
}
