"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Globe, Menu, X } from "lucide-react";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = (href: string) => {
    const isActive =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `text-sm font-medium transition-colors ${
      isActive
        ? "text-[#233dff] border-b-2 border-[#233dff] pb-0.5"
        : "text-gray-700 hover:text-[#233dff]"
    }`;
  };

  const mobileLinkClass = (href: string) => {
    const isActive =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? "text-[#233dff] bg-blue-50"
        : "text-gray-700 hover:text-[#233dff] hover:bg-gray-50"
    }`;
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/faculty", label: t("nav.faculty") },
    { href: "/academics", label: t("nav.academics") },
    { href: "/student-works", label: t("nav.studentWorks") },
    { href: "/news", label: t("nav.news") },
    { href: "/contact", label: t("nav.contact") },
  ];

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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={navLinkClass(href)}>
                {label}
              </Link>
            ))}

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

          {/* Mobile: language + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setLanguage(language === "th" ? "en" : "th")}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#233dff] transition-colors"
            >
              <Globe className="h-4 w-4" />
              {language === "th" ? "EN" : "TH"}
            </button>
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={mobileLinkClass(href)}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
