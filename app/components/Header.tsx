"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  const navLinkClass = (href: string) => {
    const isActive =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `text-sm font-medium transition-colors ${
      isActive
        ? "text-[#233dff] border-b-2 border-[#233dff] pb-0.5"
        : "text-gray-700 hover:text-[#233dff]"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#233dff] to-[#bf3618] p-0.5 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="CE Logo"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {t("dept.name")}
              </h1>
              <p className="text-sm text-gray-600">{t("dept.subtitle")}</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={navLinkClass("/")}>
              {t("nav.home")}
            </Link>
            <Link href="/about" className={navLinkClass("/about")}>
              {t("nav.about")}
            </Link>
            <Link href="/faculty" className={navLinkClass("/faculty")}>
              {t("nav.faculty")}
            </Link>
            <Link href="/academics" className={navLinkClass("/academics")}>
              {t("nav.academics")}
            </Link>
            <Link
              href="/student-works"
              className={navLinkClass("/student-works")}
            >
              {t("nav.studentWorks")}
            </Link>
            <Link href="/news" className={navLinkClass("/news")}>
              {t("nav.news")}
            </Link>
            <Link href="/contact" className={navLinkClass("/contact")}>
              {t("nav.contact")}
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 ml-4 border-l pl-4">
              <Globe className="h-4 w-4 text-gray-500" />
              <button
                onClick={() => setLanguage(language === "th" ? "en" : "th")}
                className="text-sm font-medium text-gray-700 hover:text-[#233dff] transition-colors"
              >
                {language === "th" ? "EN" : "TH"}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
