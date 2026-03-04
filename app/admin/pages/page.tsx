import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import PagesTable from "./PagesTable";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  // Get statistics
  const [total, published, drafts] = await Promise.all([
    prisma.pages.count(),
    prisma.pages.count({ where: { is_published: true } }),
    prisma.pages.count({ where: { is_published: false } }),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-1">Manage static content pages</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Page
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Total Pages
          </div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Published
          </div>
          <div className="text-3xl font-bold text-green-600">{published}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Drafts</div>
          <div className="text-3xl font-bold text-orange-600">{drafts}</div>
        </div>
      </div>

      {/* Table */}
      <PagesTable />
    </div>
  );
}
