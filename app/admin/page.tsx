import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Users,
  GraduationCap,
  Newspaper,
  Lightbulb,
  MessageSquare,
} from "lucide-react";

async function getStats() {
  const [
    facultyCount,
    programsCount,
    postsCount,
    studentWorksCount,
    contactsCount,
  ] = await Promise.all([
    prisma.faculty.count(),
    prisma.programs.count(),
    prisma.posts.count(),
    prisma.student_works.count(),
    prisma.contact_messages.count({ where: { status: "new" } }),
  ]);

  return {
    facultyCount,
    programsCount,
    postsCount,
    studentWorksCount,
    contactsCount,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  const recentPosts = await prisma.posts.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      is_published: true,
      created_at: true,
    },
  });
  type RecentPost = (typeof recentPosts)[number];

  const statCards = [
    {
      title: "Faculty Members",
      value: stats.facultyCount,
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/faculty",
    },
    {
      title: "Academic Programs",
      value: stats.programsCount,
      icon: GraduationCap,
      color: "bg-purple-500",
      href: "/admin/programs",
    },
    {
      title: "News & Events",
      value: stats.postsCount,
      icon: Newspaper,
      color: "bg-green-500",
      href: "/admin/posts",
    },
    {
      title: "Student Works",
      value: stats.studentWorksCount,
      icon: Lightbulb,
      color: "bg-yellow-500",
      href: "/admin/student-works",
    },
    {
      title: "Unread Messages",
      value: stats.contactsCount,
      icon: MessageSquare,
      color: "bg-red-500",
      href: "/admin/contacts",
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your website today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <a
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stat.value}
            </p>
          </a>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Posts
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPosts.map((post: RecentPost) => (
                <div key={post.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      {post.type} •{" "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/posts/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
              >
                <Newspaper className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">New Post</p>
              </a>
              <a
                href="/admin/faculty/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Add Faculty</p>
              </a>
              <a
                href="/admin/programs/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
              >
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">New Program</p>
              </a>
              <a
                href="/admin/student-works/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center"
              >
                <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Add Work</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
