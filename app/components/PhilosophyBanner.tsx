"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

export default function PhilosophyBanner() {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-[#6b0f1a]">
      <div className="container mx-auto px-4 text-center">
          <p className="text-red-200 text-sm font-semibold uppercase tracking-widest mb-2">
          {t("home.philosophy.title")}
        </p>
        <h2 className="text-white text-2xl md:text-3xl font-bold">
          {t("home.philosophy.text")}
        </h2>
      </div>
    </section>
  );
}
