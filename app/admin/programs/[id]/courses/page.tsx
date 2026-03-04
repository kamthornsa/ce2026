"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, ArrowLeft, Edit, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  course_code: string | null;
  course_name_en: string;
  course_name_th: string | null;
  credits: number | null;
  year_no: number | null;
  term_no: number | null;
}

interface Program {
  id: string;
  name_en: string;
  name_th: string | null;
}

export default function ProgramCoursesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    course_code: "",
    course_name_en: "",
    course_name_th: "",
    credits: 3,
    year_no: 1,
    term_no: 1,
    description_html: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [programRes, coursesRes] = await Promise.all([
        fetch(`/api/admin/programs/${id}`),
        fetch(`/api/admin/programs/${id}/courses`),
      ]);

      if (programRes.ok && coursesRes.ok) {
        const programData = await programRes.json();
        const coursesData = await coursesRes.json();
        setProgram(programData);
        setCourses(coursesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/admin/programs/${id}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchData();
        setShowAddForm(false);
        setFormData({
          course_code: "",
          course_name_en: "",
          course_name_th: "",
          credits: 3,
          year_no: 1,
          term_no: 1,
          description_html: "",
        });
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add course");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses(courses.filter((c) => c.id !== courseId));
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const groupedCourses = courses.reduce(
    (acc, course) => {
      const year = course.year_no || 0;
      const term = course.term_no || 0;
      const key = `${year}-${term}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(course);
      return acc;
    },
    {} as Record<string, Course[]>,
  );

  if (isLoading) {
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
        <Link
          href="/admin/programs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Programs List
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600 mt-1">
              {program?.name_en}
              {program?.name_th && ` (${program.name_th})`}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
          <form onSubmit={handleAddCourse}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.course_code}
                  onChange={(e) =>
                    setFormData({ ...formData, course_code: e.target.value })
                  }
                  placeholder="e.g., CE101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credits: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.course_name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, course_name_en: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name (Thai)
                </label>
                <input
                  type="text"
                  value={formData.course_name_th}
                  onChange={(e) =>
                    setFormData({ ...formData, course_name_th: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={formData.year_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year_no: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {[1, 2, 3, 4, 5].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term
                </label>
                <select
                  value={formData.term_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      term_no: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {[1, 2, 3].map((term) => (
                    <option key={term} value={term}>
                      Term {term}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Course
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-6">
        {Object.keys(groupedCourses)
          .sort()
          .map((key) => {
            const [year, term] = key.split("-");
            const coursesInGroup = groupedCourses[key];

            return (
              <div key={key} className="bg-white rounded-lg shadow">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h3 className="font-semibold text-gray-900">
                    Year {year} - Term {term}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {coursesInGroup.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {course.course_code && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                                {course.course_code}
                              </span>
                            )}
                            <h4 className="font-medium text-gray-900">
                              {course.course_name_en}
                            </h4>
                            {course.credits && (
                              <span className="text-sm text-gray-500">
                                ({course.credits} credits)
                              </span>
                            )}
                          </div>
                          {course.course_name_th && (
                            <p className="text-sm text-gray-600 mt-1">
                              {course.course_name_th}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

        {courses.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No courses added yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Add your first course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
