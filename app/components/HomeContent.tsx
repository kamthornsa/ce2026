"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: Date | null;
  media_assets: { file_path: string; alt_text: string | null } | null;
};

type EventItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: Date | null;
  event_start_at: Date | null;
  event_end_at: Date | null;
};

type ProgramItem = {
  id: string;
  name_en: string;
  slug: string;
  level: string;
};

type Props = {
  latestNews: NewsItem[];
  latestEvents: EventItem[];
  programs: ProgramItem[];
};

export default function HomeContent({
  latestNews,
  latestEvents,
  programs,
}: Props) {
  const { t } = useLanguage();

  const fmtDay = (d: Date) => d.toLocaleDateString("th-TH", { day: "numeric" });
  const fmtMonth = (d: Date) =>
    d.toLocaleDateString("th-TH", { month: "short" });
  const fmtYear = (d: Date) => d.getFullYear() + 543;

  return (
    <>
      {/* Latest News + Events */}
      {(latestNews.length > 0 || latestEvents.length > 0) && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* News Column (wider) */}
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {t("home.section.news")}
                  </h2>
                  <Link
                    href="/news?type=news"
                    className="text-[#233dff] text-sm font-semibold hover:text-[#1a2ecc] flex items-center"
                  >
                    {t("home.section.viewAll")}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {latestNews.map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.slug}`}
                      className="group block"
                    >
                      {idx === 0 ? (
                        <article className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                            {post.media_assets?.file_path && (
                              <img
                                src={post.media_assets.file_path}
                                alt={post.media_assets.alt_text || post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                          </div>
                          <div className="p-4">
                            <time className="text-xs text-gray-400">
                              {post.published_at
                                ? new Date(
                                    post.published_at,
                                  ).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : ""}
                            </time>
                            <h3 className="text-base font-bold mt-1 group-hover:text-[#233dff] transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>
                        </article>
                      ) : (
                        <article className="flex gap-3 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow p-3">
                          <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                            {post.media_assets?.file_path && (
                              <img
                                src={post.media_assets.file_path}
                                alt={post.media_assets.alt_text || post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <time className="text-xs text-gray-400">
                              {post.published_at
                                ? new Date(
                                    post.published_at,
                                  ).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : ""}
                            </time>
                            <h3 className="text-sm font-semibold mt-1 group-hover:text-[#233dff] transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {post.excerpt}
                            </p>
                          </div>
                        </article>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Events Column */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {t("home.section.events")}
                  </h2>
                  <Link
                    href="/news?type=event"
                    className="text-[#233dff] text-sm font-semibold hover:text-[#1a2ecc] flex items-center"
                  >
                    {t("home.section.viewAll")}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                {latestEvents.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 rounded-2xl bg-gray-50">
                    <p className="text-sm">{t("home.section.noEvents")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {latestEvents.map((event) => {
                      const start = event.event_start_at
                        ? new Date(event.event_start_at)
                        : event.published_at
                          ? new Date(event.published_at)
                          : null;
                      const end = event.event_end_at
                        ? new Date(event.event_end_at)
                        : null;
                      const sameMonth =
                        end &&
                        start &&
                        start.getMonth() === end.getMonth() &&
                        start.getFullYear() === end.getFullYear();

                      return (
                        <Link
                          key={event.id}
                          href={`/news/${event.slug}`}
                          className="group block"
                        >
                          <div className="flex gap-4 items-start rounded-xl bg-white shadow-sm hover:shadow-md transition-all p-3 group-hover:-translate-y-0.5 duration-200">
                            {/* Date Badge */}
                            <div className="flex-shrink-0 w-16 text-center bg-gradient-to-b from-[#233dff] to-[#1a2ecc] text-white rounded-lg py-2 px-1">
                              {(start && !end) || (start && sameMonth) ? (
                                <>
                                  <div className="text-lg font-bold leading-none">
                                    {sameMonth && end
                                      ? `${fmtDay(start)}–${fmtDay(end)}`
                                      : fmtDay(start!)}
                                  </div>
                                  <div className="text-xs mt-1 opacity-90">
                                    {fmtMonth(start!)}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {fmtYear(start!)}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-xs font-bold leading-tight">
                                    {fmtDay(start!)} {fmtMonth(start!)}
                                  </div>
                                  <div className="text-xs opacity-75 leading-tight my-0.5">
                                    –
                                  </div>
                                  <div className="text-xs font-bold leading-tight">
                                    {fmtDay(end!)} {fmtMonth(end!)}
                                  </div>
                                  <div className="text-xs opacity-75 mt-1">
                                    {fmtYear(start!)}
                                  </div>
                                </>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#233dff] text-xs font-medium rounded mb-1">
                                {t("home.section.eventBadge")}
                              </span>
                              <h3 className="text-sm font-semibold group-hover:text-[#233dff] transition-colors line-clamp-2">
                                {event.title}
                              </h3>
                              {event.excerpt && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                  {event.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">
              {t("home.section.programs")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {programs.map((program) => (
                <Link key={program.id} href={`/academics/${program.slug}`}>
                  <div className="bg-white p-6 rounded-lg border hover:border-[#233dff] hover:shadow-md transition-all">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-[#233dff] text-sm font-semibold rounded-full mb-3">
                      {program.level.charAt(0).toUpperCase() +
                        program.level.slice(1)}
                    </span>
                    <h3 className="text-xl font-semibold mb-2">
                      {program.name_en}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/academics"
                className="inline-flex items-center text-[#233dff] font-semibold hover:text-[#1a2ecc]"
              >
                {t("home.section.viewAllPrograms")}{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
