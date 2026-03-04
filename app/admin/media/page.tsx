import { prisma } from "@/lib/db";
import { Upload } from "lucide-react";
import MediaLibrary from "./MediaLibrary";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  // Get statistics
  const [total, images, documents, videos] = await Promise.all([
    prisma.media_assets.count(),
    prisma.media_assets.count({
      where: { mime_type: { startsWith: "image/" } },
    }),
    prisma.media_assets.count({
      where: {
        OR: [
          { mime_type: { startsWith: "application/pdf" } },
          { mime_type: { startsWith: "application/msword" } },
          { mime_type: { contains: "document" } },
          { mime_type: { contains: "sheet" } },
        ],
      },
    }),
    prisma.media_assets.count({
      where: { mime_type: { startsWith: "video/" } },
    }),
  ]);

  // Get total size
  const result = await prisma.media_assets.aggregate({
    _sum: {
      file_size_bytes: true,
    },
  });

  const totalSizeMB = result._sum.file_size_bytes
    ? Number(result._sum.file_size_bytes) / (1024 * 1024)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-1">
          Manage images, documents, and other media files
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Total Files
          </div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Images</div>
          <div className="text-3xl font-bold text-blue-600">{images}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Documents
          </div>
          <div className="text-3xl font-bold text-green-600">{documents}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Videos</div>
          <div className="text-3xl font-bold text-orange-600">{videos}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Total Size
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {totalSizeMB.toFixed(1)}
            <span className="text-lg ml-1">MB</span>
          </div>
        </div>
      </div>

      {/* Media Library */}
      <MediaLibrary />
    </div>
  );
}
