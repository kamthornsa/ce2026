import { prisma } from "@/lib/db";
import { generateSEO } from "@/lib/seo";
import AcademicsContent from "./AcademicsContent";

export const dynamic = "force-dynamic";

export const metadata = generateSEO({
  title: "Academic Programs",
  description:
    "Explore our comprehensive range of Computer Engineering programs from Bachelor to Doctoral level.",
  path: "/academics",
});

export const revalidate = 60;

export default async function AcademicsPage() {
  const programs = await prisma.programs.findMany({
    where: { is_published: true },
    orderBy: [{ sort_order: "asc" }, { level: "asc" }],
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return <AcademicsContent programs={programs} />;
}
