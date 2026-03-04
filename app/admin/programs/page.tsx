import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import ProgramsTable from "./ProgramsTable";

export default async function ProgramsListPage() {
  const programs = await prisma.programs.findMany({
    orderBy: [{ sort_order: "asc" }, { name_en: "asc" }],
    include: {
      _count: {
        select: {
          courses: true,
          program_files: true,
        },
      },
    },
  });
  type ProgramRow = (typeof programs)[number];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Programs Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage academic programs and curricula
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Program
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Programs</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {programs.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Undergraduate</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {programs.filter((p: ProgramRow) => p.level === "bachelor").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Master's</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {programs.filter((p: ProgramRow) => p.level === "master").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Doctoral</p>
          <p className="text-3xl font-bold text-pink-600 mt-1">
            {programs.filter((p: ProgramRow) => p.level === "doctoral").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <ProgramsTable initialData={programs} />
      </div>
    </div>
  );
}
