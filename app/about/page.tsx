import { generateSEO } from "@/lib/seo";
import AboutContent from "./AboutContent";

export const revalidate = 60;

export const metadata = generateSEO({
  title: "About Us",
  description:
    "Learn about the Computer Engineering Department, our mission, vision, and commitment to excellence in education and research.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutContent />;
}
