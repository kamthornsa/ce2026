"use client";

import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import ContactForm from "./ContactForm";

export default function ContactContent() {
  const { t } = useLanguage();

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("contact.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {t("contact.getInTouch")}
            </h2>

            <div className="space-y-6 mb-8">
              {/* Address */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("contact.address")}</h3>
                  <p className="text-gray-600">
                    {t("contact.addressLine1")}
                    <br />
                    {t("contact.addressLine2")}
                    <br />
                    {t("contact.addressLine3")}
                  </p>
                  <a
                    href="https://maps.app.goo.gl/3u1xDVfUtGmysyCw6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-purple-600 hover:text-purple-800 underline"
                  >
                    {t("contact.viewMap")}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("contact.email")}</h3>
                  <a
                    href="mailto:kamthorn.sa@ksu.ac.th"
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    kamthorn.sa@ksu.ac.th
                  </a>
                </div>
              </div>

              {/* Facebook */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    {t("contact.facebook")}
                  </h3>
                  <a
                    href="https://www.facebook.com/ceksu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    facebook.com/ceksu
                  </a>
                </div>
              </div>
            </div>

            {/* Messenger Button */}
            <a
              href="https://www.facebook.com/ceksu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-8"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.84 1.348 5.381 3.465 7.094V22l3.175-1.746a10.813 10.813 0 003.36.529c5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm.998 12.438l-2.545-2.714-4.967 2.714 5.467-5.801 2.607 2.714 4.905-2.714-5.467 5.8z" />
              </svg>
              {t("contact.messageOnFacebook")}
            </a>

            {/* Office Hours */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">{t("contact.officeHours")}</h3>
              <div className="space-y-2 text-gray-600">
                <p>{t("contact.officeHoursWeekday")}</p>
                <p>{t("contact.officeHoursWeekend")}</p>
                <p className="text-sm text-gray-500 mt-3">
                  {t("contact.officeHoursNote")}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">
                {t("contact.sendMessage")}
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
