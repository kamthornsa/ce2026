import { generateSEO } from "@/lib/seo";
import ContactContent from "./ContactContent";

export const revalidate = 60;

export const metadata = generateSEO({
  title: "Contact Us",
  description:
    "Get in touch with the Computer Engineering Department. We welcome your questions, feedback, and inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactContent />;
}
