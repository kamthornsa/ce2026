import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import StudentWorksTable from "./StudentWorksTable";

export const dynamic = "force-dynamic";

export default async function StudentWorksPage() {
  // Get statistics
  const [total, projects, competitions, other, published] = await Promise.all([
    prisma.student_works.count(),
    prisma.student_works.count({ where: { work_type: "project" } }),
    prisma.student_works.count({ where: { work_type: "competition" } }),
    prisma.student_works.count({ where: { work_type: "other" } }),
    prisma.student_works.count({ where: { is_published: true } }),
  ]);

  // Get unique years for filter
  const works = await prisma.student_works.findMany({
    select: { academic_year: true },
    distinct: ["academic_year"],
    orderBy: { academic_year: "desc" },
  });
  type WorkYearRow = (typeof works)[number];

  const years = works.map((w: WorkYearRow) => w.academic_year);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Works</h1>
          <p className="text-gray-600 mt-1">
            Manage student projects, theses, and research works
          </p>
        </div>
        <Link
          href="/admin/student-works/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Student Work
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Total Works
          </div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Projects</div>
          <div className="text-3xl font-bold text-blue-600">{projects}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Competitions
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {competitions}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Other</div>
          <div className="text-3xl font-bold text-gray-600">{other}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Published
          </div>
          <div className="text-3xl font-bold text-purple-600">{published}</div>
        </div>
      </div>

      {/* Table */}
      <StudentWorksTable years={years} />
    </div>
  );
}
