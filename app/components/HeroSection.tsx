"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gradient-to-br from-[#233dff] via-[#1a2ecc] to-[#bf3618] text-white">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {t("home.hero.title")}
            <br />
            {t("home.hero.subtitle")}
          </h1>
          <p className="text-base md:text-lg mb-8 text-blue-100 max-w-2xl">
            {t("home.hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/academics"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#233dff] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("home.hero.explorePrograms")}{" "}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#233dff] transition-colors"
            >
              {t("home.hero.aboutUs")}
            </Link>
            <a
              href="https://admission.ksu.ac.th/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              {t("home.hero.applyNow")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
