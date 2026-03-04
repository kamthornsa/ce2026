"use client";

import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface Program {
  id: string;
  slug: string;
  name_en: string;
  name_th: string | null;
  level: string;
  overview_html: string | null;
  _count: { courses: number };
}

interface AcademicsContentProps {
  programs: Program[];
}

export default function AcademicsContent({ programs }: AcademicsContentProps) {
  const { t, language } = useLanguage();

  const grouped = {
    bachelor: programs.filter((p) => p.level === "bachelor"),
    master: programs.filter((p) => p.level === "master"),
    doctoral: programs.filter((p) => p.level === "doctoral"),
  };

  const levelConfig = {
    bachelor: {
      label: t("academics.level.bachelor"),
      color: "purple",
      icon: <GraduationCap className="h-8 w-8 text-purple-600 mr-3" />,
      badgeCls: "bg-purple-100 text-purple-700",
      hoverBorder: "hover:border-purple-600",
      hoverText: "group-hover:text-purple-600",
      iconEl: (
        <BookOpen className="h-6 w-6 text-purple-600 flex-shrink-0 ml-2" />
      ),
    },
    master: {
      label: t("academics.level.master"),
      color: "blue",
      icon: <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />,
      badgeCls: "bg-blue-100 text-blue-700",
      hoverBorder: "hover:border-blue-600",
      hoverText: "group-hover:text-blue-600",
      iconEl: <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0 ml-2" />,
    },
    doctoral: {
      label: t("academics.level.doctoral"),
      color: "indigo",
      icon: <GraduationCap className="h-8 w-8 text-indigo-600 mr-3" />,
      badgeCls: "bg-indigo-100 text-indigo-700",
      hoverBorder: "hover:border-indigo-600",
      hoverText: "group-hover:text-indigo-600",
      iconEl: (
        <BookOpen className="h-6 w-6 text-indigo-600 flex-shrink-0 ml-2" />
      ),
    },
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("academics.hero.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("academics.hero.description")}
          </p>
        </div>

        {(["bachelor", "master", "doctoral"] as const).map((level) => {
          const list = grouped[level];
          if (list.length === 0) return null;
          const cfg = levelConfig[level];
          return (
            <section key={level} className="mb-16">
              <div className="flex items-center mb-6">
                {cfg.icon}
                <h2 className="text-3xl font-bold">{cfg.label}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {list.map((program) => (
                  <Link key={program.id} href={`/academics/${program.slug}`}>
                    <article
                      className={`bg-white border rounded-lg p-6 ${cfg.hoverBorder} hover:shadow-lg transition-all group`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3
                          className={`text-2xl font-bold ${cfg.hoverText} transition-colors`}
                        >
                          {language === "th" && program.name_th
                            ? program.name_th
                            : program.name_en}
                        </h3>
                        {cfg.iconEl}
                      </div>
                      {program.name_th && language === "en" && (
                        <p className="text-gray-600 mb-3">{program.name_th}</p>
                      )}
                      {program.overview_html && (
                        <div
                          className="text-gray-700 line-clamp-3 text-sm mb-4"
                          dangerouslySetInnerHTML={{
                            __html:
                              program.overview_html
                                .replace(/<[^>]*>/g, "")
                                .substring(0, 200) + "...",
                          }}
                        />
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <span
                          className={`${cfg.badgeCls} px-3 py-1 rounded-full font-medium`}
                        >
                          {program._count.courses} {t("academics.courses")}
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {programs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("academics.noPrograms")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
