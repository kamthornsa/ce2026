"use client";

import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface Work {
  id: string;
  slug: string;
  title: string;
  work_type: string;
  academic_year: number | null;
  summary: string | null;
  media_assets: { file_path: string; alt_text: string | null } | null;
}

interface StudentWorksContentProps {
  works: Work[];
  years: { academic_year: number | null }[];
  yearFilter?: number;
  typeFilter?: string;
}

export default function StudentWorksContent({
  works,
  years,
  yearFilter,
  typeFilter,
}: StudentWorksContentProps) {
  const { t } = useLanguage();

  const typeLabel = (type: string) => {
    if (type === "project") return t("studentWorks.type.project");
    if (type === "competition") return t("studentWorks.type.competition");
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const activeBtn = "bg-[#233dff] text-white";
  const inactiveBtn = "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("studentWorks.hero.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("studentWorks.hero.description")}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          {/* Year filter */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="font-semibold text-gray-700">
              {t("studentWorks.filter.year")}:
            </span>
            <Link
              href="/student-works"
              className={`px-4 py-2 rounded-lg transition-colors ${!yearFilter ? activeBtn : inactiveBtn}`}
            >
              {t("studentWorks.filter.all")}
            </Link>
            {years.map(
              (y) =>
                y.academic_year && (
                  <Link
                    key={y.academic_year}
                    href={`/student-works?year=${y.academic_year}${typeFilter ? `&type=${typeFilter}` : ""}`}
                    className={`px-4 py-2 rounded-lg transition-colors ${yearFilter === y.academic_year ? activeBtn : inactiveBtn}`}
                  >
                    {y.academic_year}
                  </Link>
                ),
            )}
          </div>

          {/* Type filter — only project & competition */}
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-700">
              {t("studentWorks.filter.type")}:
            </span>
            <Link
              href={`/student-works${yearFilter ? `?year=${yearFilter}` : ""}`}
              className={`px-4 py-2 rounded-lg transition-colors ${!typeFilter ? activeBtn : inactiveBtn}`}
            >
              {t("studentWorks.filter.all")}
            </Link>
            <Link
              href={`/student-works?type=project${yearFilter ? `&year=${yearFilter}` : ""}`}
              className={`px-4 py-2 rounded-lg transition-colors ${typeFilter === "project" ? activeBtn : inactiveBtn}`}
            >
              {t("studentWorks.type.project")}
            </Link>
            <Link
              href={`/student-works?type=competition${yearFilter ? `&year=${yearFilter}` : ""}`}
              className={`px-4 py-2 rounded-lg transition-colors ${typeFilter === "competition" ? activeBtn : inactiveBtn}`}
            >
              {t("studentWorks.type.competition")}
            </Link>
          </div>
        </div>

        {/* Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work) => (
            <Link key={work.id} href={`/student-works/${work.slug}`}>
              <article className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                <div className="w-full aspect-video bg-gradient-to-br from-blue-200 to-gray-200 group-hover:from-blue-300 group-hover:to-gray-300 transition-colors flex items-center justify-center overflow-hidden">
                  {work.media_assets?.file_path ? (
                    <img
                      src={work.media_assets.file_path}
                      alt={work.media_assets.alt_text || work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Lightbulb className="h-16 w-16 text-white opacity-50" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-[#233dff] rounded text-xs font-semibold">
                      {typeLabel(work.work_type)}
                    </span>
                    {work.academic_year && (
                      <span className="text-sm text-gray-500">
                        {work.academic_year}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-[#233dff] transition-colors line-clamp-2">
                    {work.title}
                  </h2>
                  {work.summary && (
                    <p className="text-gray-600 line-clamp-3 flex-1">
                      {work.summary}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {works.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("studentWorks.noResults")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
