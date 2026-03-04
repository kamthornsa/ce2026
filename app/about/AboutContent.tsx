"use client";

import { Users, Award, BookOpen, Lightbulb } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function AboutContent() {
  const { t } = useLanguage();

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("about.hero.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("about.hero.subtitle")}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              {t("about.mission.title")}
            </h2>
            <p className="text-lg text-purple-100 leading-relaxed">
              {t("about.mission.text")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              {t("about.vision.title")}
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              {t("about.vision.text")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white border rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">200+</div>
            <div className="text-gray-600">{t("about.stats.students")}</div>
          </div>
          <div className="text-center p-6 bg-white border rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">9</div>
            <div className="text-gray-600">{t("about.stats.faculty")}</div>
          </div>
          <div className="text-center p-6 bg-white border rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
            <div className="text-gray-600">{t("about.stats.research")}</div>
          </div>
          <div className="text-center p-6 bg-white border rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">10+</div>
            <div className="text-gray-600">{t("about.stats.years")}</div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.values.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("about.values.excellence.title")}
              </h3>
              <p className="text-gray-600">
                {t("about.values.excellence.desc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("about.values.innovation.title")}
              </h3>
              <p className="text-gray-600">
                {t("about.values.innovation.desc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("about.values.collaboration.title")}
              </h3>
              <p className="text-gray-600">
                {t("about.values.collaboration.desc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("about.values.integrity.title")}
              </h3>
              <p className="text-gray-600">
                {t("about.values.integrity.desc")}
              </p>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-gray-50 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">
            {t("about.history.title")}
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("about.history.p1")}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {t("about.history.p2")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
