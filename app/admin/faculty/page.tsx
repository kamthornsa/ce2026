import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import FacultyTable from "./FacultyTable";

export default async function FacultyListPage() {
  const faculty = await prisma.faculty.findMany({
    orderBy: [{ sort_order: "asc" }, { full_name_en: "asc" }],
  });
  type FacultyRow = (typeof faculty)[number];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Faculty Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage faculty profiles and information
          </p>
        </div>
        <Link
          href="/admin/faculty/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Faculty
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Faculty</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {faculty.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Published</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {faculty.filter((f: FacultyRow) => f.is_published).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Draft</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">
            {faculty.filter((f: FacultyRow) => !f.is_published).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">With Email</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {faculty.filter((f: FacultyRow) => f.email).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <FacultyTable initialData={faculty} />
      </div>
    </div>
  );
}
