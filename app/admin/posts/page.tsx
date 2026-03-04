import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import PostsTable from "./PostsTable";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  // Get statistics
  const [total, news, events, announcements, published] = await Promise.all([
    prisma.posts.count(),
    prisma.posts.count({ where: { type: "news" } }),
    prisma.posts.count({ where: { type: "event" } }),
    prisma.posts.count({ where: { type: "announcement" } }),
    prisma.posts.count({ where: { is_published: true } }),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Events</h1>
          <p className="text-gray-600 mt-1">
            Manage news articles, events, and announcements
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Post
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Total Posts
          </div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">News</div>
          <div className="text-3xl font-bold text-blue-600">{news}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Events</div>
          <div className="text-3xl font-bold text-green-600">{events}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Announcements
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {announcements}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Published
          </div>
          <div className="text-3xl font-bold text-purple-600">{published}</div>
        </div>
      </div>

      {/* Table */}
      <PostsTable />
    </div>
  );
}
