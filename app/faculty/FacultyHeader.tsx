"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

export default function FacultyHeader() {
  const { t } = useLanguage();
  return (
    <div className="mb-12 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        {t("faculty.hero.title")}
      </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        {t("faculty.hero.subtitle")}
      </p>
    </div>
  );
}
