"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Star,
  ImagePlus,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface UploadedImage {
  id: string;
  file_path: string;
  original_name: string;
}

export default function NewStudentWorkPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    work_type: "project",
    academic_year: new Date().getFullYear(),
    summary: "",
    html_content: "",
    meta_title: "",
    meta_description: "",
    is_published: false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("alt_text", file.name);
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          newImages.push({
            id: data.id,
            file_path: data.file_path,
            original_name: data.original_name,
          });
        }
      } catch {}
    }

    setUploadedImages((prev) => {
      const updated = [...prev, ...newImages];
      if (!coverImageId && updated.length > 0) setCoverImageId(updated[0].id);
      return updated;
    });
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (coverImageId === id) setCoverImageId(updated[0]?.id ?? null);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/student-works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          academic_year: parseInt(formData.academic_year.toString()),
          cover_image_id: coverImageId || undefined,
          asset_ids: uploadedImages.map((img) => img.id),
        }),
      });

      if (response.ok) {
        router.push("/admin/student-works");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create student work");
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
    } else if (name === "academic_year") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || new Date().getFullYear(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
          Back to Student Works
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Student Work
        </h1>
        <p className="text-gray-600 mt-1">
          Add a new student project, thesis, or research
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
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
                      Work Type *
                    </label>
                    <select
                      name="work_type"
                      required
                      value={formData.work_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="project">Project</option>
                      <option value="competition">Competition</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <input
                      type="number"
                      name="academic_year"
                      required
                      min="2000"
                      max="2100"
                      value={formData.academic_year}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    rows={3}
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Brief summary of the work..."
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
                    placeholder="<p>Detailed description...</p>"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
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
                    placeholder="Leave blank to auto-generate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    rows={3}
                    value={formData.meta_description}
                    onChange={handleChange}
                    placeholder="Leave blank to auto-generate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-purple-500" />
                Images
              </h2>

              {/* Upload zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Click to upload images
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, WEBP (multiple)
                    </span>
                  </>
                )}
              </button>

              {/* Thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500 mb-2">
                    ⭐ = ภาพปก (Cover) — คลิกเพื่อเปลี่ยน
                  </p>
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-colors ${
                        coverImageId === img.id
                          ? "border-purple-400 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-14 w-14 rounded flex-shrink-0 overflow-hidden bg-gray-100">
                        <Image
                          src={img.file_path}
                          alt={img.original_name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info + actions */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">
                          {img.original_name}
                        </p>
                        <button
                          type="button"
                          onClick={() => setCoverImageId(img.id)}
                          className={`mt-1 text-xs flex items-center gap-1 ${
                            coverImageId === img.id
                              ? "text-purple-600 font-semibold"
                              : "text-gray-400 hover:text-purple-500"
                          }`}
                        >
                          <Star
                            className={`h-3 w-3 ${coverImageId === img.id ? "fill-purple-500" : ""}`}
                          />
                          {coverImageId === img.id ? "Cover" : "Set as cover"}
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publishing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Publishing</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Published
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Create Student Work
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
