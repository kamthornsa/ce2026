"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Search,
  Trash2,
  Edit2,
  Copy,
  Image as ImageIcon,
  FileText,
  Film,
  File,
  X,
} from "lucide-react";

interface MediaAsset {
  id: string;
  file_path: string;
  original_name: string | null;
  mime_type: string;
  file_size_bytes: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  title_text: string | null;
  created_at: string;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mimeFilter, setMimeFilter] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ alt_text: "", title_text: "" });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (mimeFilter) params.set("mime_type", mimeFilter);

      const response = await fetch(`/api/admin/media?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchMedia();
        e.target.value = "";
      } else {
        const data = await response.json();
        alert(data.error || "Failed to upload file");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMedia();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete media");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleEdit = (asset: MediaAsset) => {
    setSelectedMedia(asset);
    setEditForm({
      alt_text: asset.alt_text || "",
      title_text: asset.title_text || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMedia) return;

    try {
      const response = await fetch(`/api/admin/media/${selectedMedia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        fetchMedia();
        setShowEditModal(false);
      } else {
        alert("Failed to update media");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-6 w-6" />;
    if (mimeType.startsWith("video/")) return <Film className="h-6 w-6" />;
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return <FileText className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: string) => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSearch = () => {
    fetchMedia();
  };

  return (
    <div>
      {/* Upload & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Upload Button */}
          <div>
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 cursor-pointer transition-colors ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              {isUploading ? "Uploading..." : "Upload File"}
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div>
            <select
              value={mimeFilter}
              onChange={(e) => setMimeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="image/">Images</option>
              <option value="video/">Videos</option>
              <option value="application/pdf">PDFs</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {media.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No media files found
            </div>
          ) : (
            media.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Preview */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {asset.mime_type.startsWith("image/") ? (
                    <img
                      src={asset.file_path}
                      alt={asset.alt_text || asset.original_name || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      {getFileIcon(asset.mime_type)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 truncate mb-1">
                    {asset.original_name}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {formatFileSize(asset.file_size_bytes)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(asset.id)}
                      className="flex-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      title="Copy UUID"
                    >
                      <Copy className="h-3 w-3 inline mr-1" />
                      ID
                    </button>
                    <button
                      onClick={() => handleEdit(asset)}
                      className="flex-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(asset.id, asset.original_name || "file")
                      }
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Media</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  value={selectedMedia.original_name || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UUID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedMedia.id}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedMedia.id)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editForm.alt_text}
                  onChange={(e) =>
                    setEditForm({ ...editForm, alt_text: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title_text}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title_text: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
