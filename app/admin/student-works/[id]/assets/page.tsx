"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
} from "lucide-react";

interface Asset {
  file_id: string;
  caption: string | null;
  sort_order: number;
}

interface StudentWork {
  id: string;
  title: string;
  student_work_assets: Asset[];
}

export default function StudentWorkAssetsPage() {
  const router = useRouter();
  const params = useParams();
  const workId = params.id as string;

  const [work, setWork] = useState<StudentWork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAsset, setNewAsset] = useState({
    file_id: "",
    caption: "",
  });

  useEffect(() => {
    fetchWork();
  }, [workId]);

  const fetchWork = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/student-works/${workId}`);
      if (response.ok) {
        const data = await response.json();
        setWork(data);
      } else {
        alert("Student work not found");
        router.back();
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.file_id.trim()) return;

    try {
      const response = await fetch(
        `/api/admin/student-works/${workId}/assets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_id: newAsset.file_id,
            caption: newAsset.caption || null,
          }),
        },
      );

      if (response.ok) {
        setNewAsset({ file_id: "", caption: "" });
        fetchWork();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add asset");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDeleteAsset = async (fileId: string) => {
    if (!confirm("Delete this asset?")) return;

    try {
      const response = await fetch(
        `/api/admin/student-works/${workId}/assets?file_id=${fileId}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        fetchWork();
      } else {
        alert("Failed to delete asset");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  if (isLoading || !work) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Student Works
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Manage Assets</h1>
        <p className="text-gray-600 mt-1">{work.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Asset Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Asset
          </h2>
          <form onSubmit={handleAddAsset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File ID (UUID) *
              </label>
              <input
                type="text"
                value={newAsset.file_id}
                onChange={(e) =>
                  setNewAsset((prev) => ({ ...prev, file_id: e.target.value }))
                }
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the UUID of the media asset from Media Library
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                value={newAsset.caption}
                onChange={(e) =>
                  setNewAsset((prev) => ({ ...prev, caption: e.target.value }))
                }
                placeholder="Optional caption"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Asset
            </button>
          </form>
        </div>

        {/* Assets List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Current Assets ({work.student_work_assets.length})
          </h2>

          {work.student_work_assets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No assets yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {work.student_work_assets.map((asset, index) => (
                <div
                  key={asset.file_id}
                  className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-mono text-gray-600 mb-1">
                      {asset.file_id}
                    </div>
                    {asset.caption && (
                      <div className="text-sm text-gray-700">
                        {asset.caption}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Order: {asset.sort_order}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleDeleteAsset(asset.file_id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
