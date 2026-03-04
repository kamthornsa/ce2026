"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Eye, Search } from "lucide-react";

interface Faculty {
  id: string;
  full_name_en: string;
  full_name_th: string | null;
  slug: string;
  academic_position: string | null;
  email: string | null;
  is_published: boolean;
}

export default function FacultyTable({
  initialData,
}: {
  initialData: Faculty[];
}) {
  const [faculty, setFaculty] = useState(initialData);
  const [search, setSearch] = useState("");

  const filteredFaculty = faculty.filter(
    (f) =>
      f.full_name_en.toLowerCase().includes(search.toLowerCase()) ||
      (f.full_name_th &&
        f.full_name_th.toLowerCase().includes(search.toLowerCase())) ||
      (f.email && f.email.toLowerCase().includes(search.toLowerCase())),
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty member?"))
      return;

    try {
      const response = await fetch(`/api/admin/faculty/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFaculty(faculty.filter((f) => f.id !== id));
      } else {
        alert("Failed to delete faculty member");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFaculty.map((faculty) => (
              <tr key={faculty.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">
                      {faculty.full_name_en}
                    </p>
                    {faculty.full_name_th && (
                      <p className="text-sm text-gray-500">
                        {faculty.full_name_th}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">
                    {faculty.academic_position || "-"}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">
                    {faculty.email || "-"}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      faculty.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {faculty.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/faculty/${faculty.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900"
                      title="View"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/admin/faculty/${faculty.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(faculty.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFaculty.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No faculty members found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
