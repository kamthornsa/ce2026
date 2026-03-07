"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Upload, FileText, Trash2 } from "lucide-react";
import Link from "next/link";

interface ProgramFileState {
  file_id: string;
  title: string;
  sort_order: number;
  original_name: string;
}

export default function NewProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [programFiles, setProgramFiles] = useState<ProgramFileState[]>([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_th: "",
    level: "bachelor",
    overview_html: "",
    study_plan_html: "",
    meta_title: "",
    meta_description: "",
    is_published: false,
    sort_order: 0,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      e.target.value = "";
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (res.ok) {
        const media = await res.json();
        setProgramFiles((prev) => [
          ...prev,
          {
            file_id: media.id,
            title: file.name.replace(/\.pdf$/i, ""),
            sort_order: prev.length,
            original_name: media.original_name || file.name,
          },
        ]);
      } else {
        alert("Failed to upload file");
      }
    } catch {
      alert("An error occurred while uploading");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          program_files: programFiles.map(({ file_id, title, sort_order }) => ({
            file_id,
            title,
            sort_order,
          })),
        }),
      });

      if (response.ok) {
        router.push("/admin/programs");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create program");
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
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseInt(value) || 0
            : value,
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/programs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Programs List
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Program</h1>
        <p className="text-gray-600 mt-1">Create a new academic program</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name (English) *
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    required
                    value={formData.name_en}
                    onChange={handleChange}
                    placeholder="e.g., Computer Engineering"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name (Thai)
                  </label>
                  <input
                    type="text"
                    name="name_th"
                    value={formData.name_th}
                    onChange={handleChange}
                    placeholder="e.g., วิศวกรรมคอมพิวเตอร์"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Level *
                  </label>
                  <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="bachelor">Undergraduate (Bachelor's)</option>
                    <option value="master">Master's</option>
                    <option value="doctoral">Doctoral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overview (HTML)
                  </label>
                  <textarea
                    name="overview_html"
                    rows={6}
                    value={formData.overview_html}
                    onChange={handleChange}
                    placeholder="<p>Program overview...</p>"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Study Plan (HTML)
                  </label>
                  <textarea
                    name="study_plan_html"
                    rows={8}
                    value={formData.study_plan_html}
                    onChange={handleChange}
                    placeholder="<p>Study plan details...</p>"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* PDF Files */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">PDF Files</h2>
              {programFiles.length > 0 && (
                <div className="space-y-2 mb-4">
                  {programFiles.map((file, index) => (
                    <div
                      key={file.file_id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) =>
                          setProgramFiles((prev) =>
                            prev.map((f, i) =>
                              i === index ? { ...f, title: e.target.value } : f,
                            ),
                          )
                        }
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="File title"
                      />
                      <span className="text-xs text-gray-500 truncate max-w-[8rem]">
                        {file.original_name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setProgramFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <div
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                    isUploading
                      ? "border-gray-300 text-gray-400 cursor-not-allowed"
                      : "border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Add PDF File
                    </>
                  )}
                </div>
              </label>
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
                    placeholder="Leave empty to use program name"
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
                    placeholder="SEO description (recommended 150-160 characters)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Publish</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_published"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Published
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Program
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
