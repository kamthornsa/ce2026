"use client";

import Link from "next/link";
import { Facebook, Mail } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">{t("dept.name")}</h3>
            <p className="text-sm">
              {t("dept.subtitle")}
              <br />
              {t("footer.excellence")}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faculty"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.faculty")}
                </Link>
              </li>
              <li>
                <Link
                  href="/academics"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.academics")}
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link
                  href="/student-works"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.studentWorks")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("footer.studentInfoSystems")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://ess.ksu.ac.th/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.ess")}
                </a>
              </li>
              <li>
                <a
                  href="https://re.ksu.ac.th/?page=135414"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.academicCalendar")}
                </a>
              </li>
              <li>
                <a
                  href="https://ess.ksu.ac.th/KSUTE/Account/Login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.teachingEval")}
                </a>
              </li>
              <li>
                <a
                  href="https://eisksu.ksu.ac.th/student/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.activityReg")}
                </a>
              </li>
              <li>
                <a
                  href="https://itservice.ksu.ac.th/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.ictIssue")}
                </a>
              </li>
              <li>
                <a
                  href="https://opac.ksu.ac.th/Search_Basic.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.opac")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://facebook.com/ceksu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Facebook size={16} />
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="mailto:kamthorn.sa@ksu.ac.th"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail size={16} />
                  kamthorn.sa@ksu.ac.th
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.contactForm")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} {t("dept.subtitle")}.{" "}
            {t("footer.rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
