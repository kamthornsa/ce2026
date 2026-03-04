"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  type: string;
  slug: string;
  html_content: string;
  excerpt: string | null;
  thumbnail_id: string | null;
  event_start_at: string | null;
  event_end_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  post_tags: {
    tags: {
      name: string;
    };
  }[];
  media_assets: {
    id: string;
    file_path: string;
    alt_text: string | null;
  } | null;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "news",
    html_content: "",
    excerpt: "",
    tags: "",
    thumbnail_id: "",
    event_start_at: "",
    event_end_at: "",
    meta_title: "",
    meta_description: "",
    is_published: false,
    published_at: "",
  });

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`);
      if (response.ok) {
        const data: Post = await response.json();
        setFormData({
          title: data.title,
          type: data.type,
          html_content: data.html_content || "",
          excerpt: data.excerpt || "",
          tags: data.post_tags.map((pt) => pt.tags.name).join(", "),
          thumbnail_id: data.thumbnail_id || "",
          event_start_at: data.event_start_at
            ? new Date(data.event_start_at).toISOString().slice(0, 16)
            : "",
          event_end_at: data.event_end_at
            ? new Date(data.event_end_at).toISOString().slice(0, 16)
            : "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          is_published: data.is_published,
          published_at: data.published_at
            ? new Date(data.published_at).toISOString().slice(0, 16)
            : "",
        });
        if (data.media_assets?.file_path) {
          setPreviewUrl(data.media_assets.file_path);
        }
      } else {
        alert("Post not found");
        router.back();
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags,
          thumbnail_id: formData.thumbnail_id || null,
          event_start_at: formData.event_start_at || null,
          event_end_at: formData.event_end_at || null,
          published_at: formData.published_at || null,
        }),
      });

      if (response.ok) {
        router.push("/admin/posts");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update post");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const showEventFields = formData.type === "event";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("alt_text", formData.title || "Post thumbnail");
      uploadFormData.append("title_text", formData.title || "Post thumbnail");

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, thumbnail_id: data.id }));
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      alert("Failed to upload image");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, thumbnail_id: "" }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Posts
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600 mt-1">Update post information</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="news">News</option>
                      <option value="event">Event</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    rows={3}
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Brief summary..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content (HTML)
                  </label>
                  <textarea
                    name="html_content"
                    rows={12}
                    value={formData.html_content}
                    onChange={handleChange}
                    placeholder="<p>Content...</p>"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="research, technology, award (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Event Fields */}
            {showEventFields && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Event Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="event_start_at"
                      value={formData.event_start_at}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="event_end_at"
                      value={formData.event_end_at}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SEO Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    rows={2}
                    value={formData.meta_description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thumbnail Image
              </h2>
              {previewUrl ? (
                <div className="relative max-w-sm">
                  <Image
                    src={previewUrl}
                    alt="Thumbnail preview"
                    width={400}
                    height={225}
                    className="w-full rounded-lg object-cover aspect-video"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center max-w-sm aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        Click to upload
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            {/* Publishing */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Publishing
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_published"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_published"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Published
                  </label>
                </div>

                {formData.is_published && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="published_at"
                      value={formData.published_at}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update Post
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
