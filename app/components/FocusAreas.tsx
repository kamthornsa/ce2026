"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Lightbulb, Calendar } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const focusCards = [
  {
    href: "/academics",
    // TODO: replace with actual image path, e.g. "/images/focus-academics.jpg"
    image: "/api/uploads/focus-academics.png",
    overlayFrom: "from-[#233dff]/80",
    overlayTo: "to-[#1a2ecc]/60",
    accentColor: "bg-[#233dff]",
    Icon: BookOpen,
    titleKey: "home.focusArea1.title" as const,
    descKey: "home.focusArea1.desc" as const,
  },
  {
    href: "/student-works",
    // TODO: replace with actual image path, e.g. "/images/focus-studentworks.jpg"
    image: "/api/uploads/focus-studentworks.png",
    overlayFrom: "from-[#bf3618]/85",
    overlayTo: "to-[#992b13]/65",
    accentColor: "bg-[#bf3618]",
    Icon: Lightbulb,
    titleKey: "home.focusArea2.title" as const,
    descKey: "home.focusArea2.desc" as const,
  },
  {
    href: "/news",
    // TODO: replace with actual image path, e.g. "/images/focus-news.jpg"
    image: "/api/uploads/focus-news.png",
    overlayFrom: "from-[#233dff]/80",
    overlayTo: "to-[#4d5fff]/60",
    accentColor: "bg-[#4d5fff]",
    Icon: Calendar,
    titleKey: "home.focusArea3.title" as const,
    descKey: "home.focusArea3.desc" as const,
  },
];

export default function FocusAreas() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {focusCards.map(
            ({
              href,
              image,
              overlayFrom,
              overlayTo,
              accentColor,
              Icon,
              titleKey,
              descKey,
            }) => (
              <Link key={href} href={href} className="group">
                <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  {/* Fallback gradient — แสดงอยู่ใต้รูป เมื่อรูปโหลดไม่ได้จะเห็น gradient นี้ */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${overlayFrom.replace("/80", "").replace("/85", "")} ${overlayTo.replace("/60", "").replace("/65", "")}`}
                  />

                  {/* Background Image */}
                  <Image
                    src={image}
                    alt={t(titleKey)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />

                  {/* Bottom overlay — ทับเฉพาะส่วนล่างที่มีข้อความ */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t ${overlayFrom} to-transparent`}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
                    {/* Text at bottom */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 drop-shadow-sm">
                        {t(titleKey)}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                        {t(descKey)}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-white/90 text-sm font-medium">
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
