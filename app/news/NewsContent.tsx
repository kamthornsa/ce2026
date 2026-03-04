"use client";

import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatDate } from "@/lib/utils";

interface PostTag {
  tag_id: string;
  tags: { name: string };
}

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: Date | null;
  event_start_at: Date | null;
  event_end_at: Date | null;
  media_assets: { file_path: string; alt_text: string | null } | null;
  post_tags: PostTag[];
}

interface NewsContentProps {
  posts: Post[];
  typeFilter: string;
}

export default function NewsContent({ posts, typeFilter }: NewsContentProps) {
  const { t, language } = useLanguage();

  const locale = language === "th" ? "th-TH" : "en-US";

  const title =
    typeFilter === "event"
      ? t("news.title.event")
      : typeFilter === "news"
        ? t("news.title.news")
        : t("news.title.all");

  const description =
    typeFilter === "event" ? t("news.desc.event") : t("news.desc.default");

  const activeTab = "border-purple-600 text-purple-600";
  const inactiveTab = "border-transparent text-gray-600 hover:text-gray-900";

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-3xl">{description}</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <Link
            href="/news"
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${typeFilter === "all" ? activeTab : inactiveTab}`}
          >
            {t("news.filter.all")}
          </Link>
          <Link
            href="/news?type=news"
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${typeFilter === "news" ? activeTab : inactiveTab}`}
          >
            {t("news.filter.news")}
          </Link>
          <Link
            href="/news?type=event"
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${typeFilter === "event" ? activeTab : inactiveTab}`}
          >
            {t("news.filter.event")}
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`}>
              <article className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                {/* Thumbnail */}
                {post.media_assets?.file_path ? (
                  <img
                    src={post.media_assets.file_path}
                    alt={post.media_assets.alt_text || post.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-purple-200 to-blue-200 group-hover:from-purple-300 group-hover:to-blue-300 transition-colors"></div>
                )}

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Date */}
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                    {post.published_at && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <time>{formatDate(post.published_at)}</time>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Event Date */}
                  {typeFilter === "event" && post.event_start_at && (
                    <div className="mt-auto pt-4 border-t">
                      <p className="text-sm font-semibold text-purple-600">
                        {new Date(post.event_start_at).toLocaleDateString(
                          locale,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                        {post.event_end_at &&
                          post.event_end_at !== post.event_start_at && (
                            <>
                              {" – "}
                              {new Date(post.event_end_at).toLocaleDateString(
                                locale,
                                { month: "long", day: "numeric" },
                              )}
                            </>
                          )}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {post.post_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.post_tags.slice(0, 3).map((pt) => (
                        <span
                          key={pt.tag_id}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {pt.tags.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("news.noResults")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
