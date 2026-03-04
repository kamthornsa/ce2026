"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Search, Eye } from "lucide-react";

interface Program {
  id: string;
  name_en: string;
  name_th: string | null;
  slug: string;
  level: string;
  is_published: boolean;
  _count: {
    courses: number;
    program_files: number;
  };
}

const levelLabels: Record<string, { name: string; color: string }> = {
  bachelor: { name: "Undergraduate", color: "bg-blue-100 text-blue-800" },
  master: { name: "Master's", color: "bg-purple-100 text-purple-800" },
  doctoral: { name: "Doctoral", color: "bg-pink-100 text-pink-800" },
};

export default function ProgramsTable({
  initialData,
}: {
  initialData: Program[];
}) {
  const [programs, setPrograms] = useState(initialData);
  const [search, setSearch] = useState("");

  const filteredPrograms = programs.filter(
    (p) =>
      p.name_en.toLowerCase().includes(search.toLowerCase()) ||
      (p.name_th && p.name_th.toLowerCase().includes(search.toLowerCase())),
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      const response = await fetch(`/api/admin/programs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPrograms(programs.filter((p) => p.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete program");
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
            placeholder="Search programs..."
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
                Program Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courses
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Files
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
            {filteredPrograms.map((program) => {
              const levelInfo = levelLabels[program.level] || {
                name: program.level,
                color: "bg-gray-100 text-gray-800",
              };

              return (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {program.name_en}
                      </p>
                      {program.name_th && (
                        <p className="text-sm text-gray-500">
                          {program.name_th}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${levelInfo.color}`}
                    >
                      {levelInfo.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {program._count.courses}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {program._count.program_files}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        program.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {program.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/academics/${program.slug}`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/programs/${program.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No programs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
