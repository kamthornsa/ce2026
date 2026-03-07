"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Language = "th" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  th: {
    // Navigation
    "nav.home": "หน้าหลัก",
    "nav.about": "เกี่ยวกับสาขาวิชา",
    "nav.faculty": "คณาจารย์",
    "nav.academics": "หลักสูตร",
    "nav.studentWorks": "ผลงานนักศึกษา",
    "nav.news": "ข่าวสาร",
    "nav.contact": "ติดต่อ",

    // Language switcher
    "lang.th": "ไทย",
    "lang.en": "English",

    // Department
    "dept.name": "วิศวกรรมคอมพิวเตอร์",
    "dept.subtitle": "Computer Engineering",

    // Footer
    "footer.quickLinks": "ลิงก์ด่วน",
    "footer.aboutUs": "เกี่ยวกับเรา",
    "footer.programs": "หลักสูตร",
    "footer.bachelor": "ปริญญาตรี",
    "footer.master": "ปริญญาโท",
    "footer.doctoral": "ปริญญาเอก",
    "footer.contact": "ติดต่อ",
    "footer.office": "สำนักงานสาขาวิชา",
    "footer.contactForm": "แบบฟอร์มติดต่อ",
    "footer.rights": "สงวนลิขสิทธิ์",
    "footer.excellence": "ความเป็นเลิศทางเทคโนโลยี",
    "footer.studentInfoSystems": "ระบบสารสนเทศสำหรับนักศึกษา",
    "footer.ess": "ระบบบริการการศึกษา (ESS)",
    "footer.academicCalendar": "ปฏิทินการศึกษา",
    "footer.teachingEval": "ระบบประเมินการเรียนการสอน",
    "footer.activityReg": "ระบบทะเบียนกิจกรรม",
    "footer.ictIssue": "แจ้งปัญหาการใช้งาน ICT",
    "footer.opac": "บริการสืบค้นทรัพยากร (OPAC)",

    // Homepage Focus Areas
    "home.focusArea1.title": "หลักสูตรและแผนการเรียน",
    "home.focusArea1.desc": "สำรวจหลักสูตรที่ทันสมัยและแผนการเรียนที่หลากหลาย",
    "home.focusArea2.title": "ผลงานนักศึกษาและโครงงาน",
    "home.focusArea2.desc": "ชมผลงานสร้างสรรค์และโครงงานนวัตกรรมจากนักศึกษา",
    "home.focusArea3.title": "กิจกรรมภายในสาขา",
    "home.focusArea3.desc": "ติดตามข่าวสารและกิจกรรมล่าสุดของสาขาวิชา",

    // Homepage Hero
    "home.hero.title": "วิศวกรรมคอมพิวเตอร์",
    "home.hero.subtitle": "จุดเริ่มต้นแห่งอนาคต",
    "home.hero.description":
      "มุ่งพัฒนาความเชี่ยวชาญด้านสถาปัตยกรรมระบบคอมพิวเตอร์ ซอฟต์แวร์และสารสนเทศ ระบบเครือข่ายและความมั่นคงปลอดภัยไซเบอร์ ตลอดจนอินเทอร์เน็ตของสรรพสิ่ง (IoT) และการประยุกต์ใช้ปัญญาประดิษฐ์ (AI) เพื่อสร้างนวัตกรรมที่สามารถนำไปใช้งานได้จริงในภาคอุตสาหกรรมและสังคมดิจิทัล",
    "home.hero.explorePrograms": "สำรวจหลักสูตร",
    "home.hero.aboutUs": "เกี่ยวกับเรา",
    "home.hero.applyNow": "สมัครเรียน",

    // About Page
    "about.hero.title": "เกี่ยวกับสาขาวิชา",
    "about.hero.subtitle":
      "สาขาวิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยกาฬสินธุ์",
    "about.mission.title": "พันธกิจ",
    "about.mission.text":
      "มุ่งมั่นผลิตบัณฑิตด้านวิศวกรรมคอมพิวเตอร์ที่มีความรู้ความสามารถทั้งภาคทฤษฎีและปฏิบัติ มีคุณธรรมจริยธรรม และมีศักยภาพในการแข่งขันระดับสากล พร้อมงานวิจัยและนวัตกรรมที่ตอบโจทย์สังคม",
    "about.vision.title": "วิสัยทัศน์",
    "about.vision.text":
      "เป็นสาขาวิชาวิศวกรรมคอมพิวเตอร์ชั้นนำที่ขับเคลื่อนนวัตกรรมทางเทคโนโลยี มีส่วนร่วมพัฒนาสังคม และผลิตบัณฑิตที่เป็นกำลังสำคัญในการพัฒนาเทคโนโลยีแห่งอนาคต",
    "about.stats.students": "นักศึกษา",
    "about.stats.faculty": "คณาจารย์",
    "about.stats.research": "โครงการวิจัย",
    "about.stats.years": "ปีแห่งความเป็นเลิศ",
    "about.values.title": "ค่านิยมหลัก",
    "about.values.excellence.title": "ความเป็นเลิศ",
    "about.values.excellence.desc": "มุ่งสู่มาตรฐานสูงสุดในการศึกษาและการวิจัย",
    "about.values.innovation.title": "นวัตกรรม",
    "about.values.innovation.desc":
      "ส่งเสริมความคิดสร้างสรรค์และการวิจัยเทคโนโลยีล้ำสมัย",
    "about.values.collaboration.title": "ความร่วมมือ",
    "about.values.collaboration.desc":
      "สร้างความร่วมมือเพื่อสร้างผลกระทบที่ยิ่งใหญ่กว่า",
    "about.values.integrity.title": "คุณธรรม",
    "about.values.integrity.desc": "ยึดมั่นในหลักจริยธรรมในทุกสิ่งที่ปฏิบัติ",
    "about.history.title": "ประวัติความเป็นมา",
    "about.history.p1":
      "สาขาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยกาฬสินธุ์ ก่อตั้งขึ้นเมื่อปี พ.ศ. 2558 จากการหลอมรวมของสาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตกาฬสินธุ์ และสาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยราชภัฏกาฬสินธุ์ อันเป็นผลจากการรวมสองสถาบันเพื่อจัดตั้งเป็นมหาวิทยาลัยกาฬสินธุ์",
    "about.history.p2":
      "การก่อตั้งสาขาฯ มีเป้าหมายเพื่อพัฒนากำลังคนด้านวิศวกรรมคอมพิวเตอร์ที่มีความรู้ความสามารถทั้งด้านฮาร์ดแวร์ ซอฟต์แวร์ ระบบเครือข่าย และเทคโนโลยีดิจิทัลสมัยใหม่ ตอบสนองความต้องการของภาคอุตสาหกรรมและการพัฒนาประเทศ โดยมุ่งเน้นการเรียนการสอนควบคู่กับการปฏิบัติจริง การวิจัย และการบริการวิชาการแก่ชุมชน",

    // Faculty Page
    "faculty.hero.title": "คณาจารย์ประจำสาขาวิชา",
    "faculty.hero.subtitle":
      "พบกับคณาจารย์ผู้ทรงคุณวุฒิของเรา ผู้เชี่ยวชาญในสาขาวิชาของตน มุ่งมั่นในการสอนและการวิจัยเพื่อพัฒนาความเป็นเลิศด้านการศึกษา",

    // Academics Page
    "academics.hero.title": "หลักสูตรการศึกษา",
    "academics.hero.description":
      "ค้นพบหลักสูตรวิศวกรรมคอมพิวเตอร์ระดับมาตรฐานสากล ที่ออกแบบมาเพื่อเตรียมความพร้อมให้คุณรับมือกับความท้าทายและโอกาสในอนาคต",
    "academics.level.bachelor": "หลักสูตรปริญญาตรี",
    "academics.level.master": "หลักสูตรปริญญาโท",
    "academics.level.doctoral": "หลักสูตรปริญญาเอก",
    "academics.courses": "รายวิชา",
    "academics.noPrograms": "ไม่มีหลักสูตรในขณะนี้",

    // Student Works Page
    "studentWorks.hero.title": "ผลงานนักศึกษา",
    "studentWorks.hero.description":
      "ค้นพบโครงงานสร้างสรรค์และการแข่งขันที่โดดเด่นจากนักศึกษาวิศวกรรมคอมพิวเตอร์ของเรา",
    "studentWorks.filter.year": "ปีการศึกษา",
    "studentWorks.filter.type": "ประเภท",
    "studentWorks.filter.all": "ทั้งหมด",
    "studentWorks.type.project": "โครงงาน",
    "studentWorks.type.competition": "รางวัลแข่งขัน",
    "studentWorks.noResults": "ไม่พบผลงานที่ตรงกับตัวกรองที่เลือก",

    // News Page
    "news.title.all": "ข่าวสารและกิจกรรม",
    "news.title.news": "ข่าวสาร",
    "news.title.event": "กิจกรรม",
    "news.desc.default":
      "ติดตามข่าวสาร ความเคลื่อนไหว และประกาศล่าสุดจากสาขาวิชาวิศวกรรมคอมพิวเตอร์",
    "news.desc.event":
      "กิจกรรมทั้งที่กำลังจะมาถึงและที่ผ่านมาแล้วของสาขาวิชาวิศวกรรมคอมพิวเตอร์",
    "news.filter.all": "ทั้งหมด",
    "news.filter.news": "ข่าวสาร",
    "news.filter.event": "กิจกรรม",
    "news.noResults": "ไม่มีรายการในขณะนี้",

    "home.section.news": "ข่าวและแจ้งเตือน",
    "home.section.events": "กิจกรรม",
    "home.section.programs": "หลักสูตร",
    "home.section.faculty": "คณาจารย์",
    "home.section.viewAll": "ดูทั้งหมด",
    "home.section.viewAllPrograms": "ดูหลักสูตรทั้งหมด",
    "home.section.noEvents": "ไม่มีกิจกรรมในขณะนี้",
    "home.section.eventBadge": "กิจกรรม",

    // Contact Page
    "contact.title": "ติดต่อเรา",
    "contact.subtitle":
      "มีคำถามหรืออยากรู้จักเราเพิ่มเติมไหม? เรายินดีให้ความช่วยเหลือเสมอ",
    "contact.getInTouch": "ช่องทางติดต่อ",
    "contact.address": "ที่อยู่",
    "contact.addressLine1": "สาขาวิชาวิศวกรรมคอมพิวเตอร์",
    "contact.addressLine2": "คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม",
    "contact.addressLine3": "มหาวิทยาลัยกาฬสินธุ์",
    "contact.viewMap": "ดูแผนที่ Google Maps →",
    "contact.email": "อีเมล",
    "contact.facebook": "เฟซบุ๊ก",
    "contact.messageOnFacebook": "ส่งข้อความผ่าน Facebook",
    "contact.officeHours": "เวลาทำการ",
    "contact.officeHoursWeekday": "จันทร์ – ศุกร์: 8:30 – 16:30 น.",
    "contact.officeHoursWeekend": "เสาร์ – อาทิตย์: ปิดทำการ",
    "contact.officeHoursNote": "* ปิดในวันหยุดนักขัตฤกษ์",
    "contact.sendMessage": "ส่งข้อความถึงเรา",
    "contact.form.name": "ชื่อ-นามสกุล",
    "contact.form.namePlaceholder": "ชื่อ-นามสกุลของคุณ",
    "contact.form.email": "อีเมล",
    "contact.form.emailPlaceholder": "your.email@example.com",
    "contact.form.subject": "หัวข้อ",
    "contact.form.subjectPlaceholder": "เรื่องที่ต้องการติดต่อ",
    "contact.form.message": "ข้อความ",
    "contact.form.messagePlaceholder": "ข้อความของคุณ...",
    "contact.form.success": "ขอบคุณ! ข้อความของคุณถูกส่งเรียบร้อยแล้ว",
    "contact.form.error": "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    "contact.form.sending": "กำลังส่ง...",
    "contact.form.send": "ส่งข้อความ",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.faculty": "Faculty",
    "nav.academics": "Academics",
    "nav.studentWorks": "Student Works",
    "nav.news": "News & Events",
    "nav.contact": "Contact",

    // Language switcher
    "lang.th": "ไทย",
    "lang.en": "English",

    // Department
    "dept.name": "Computer Engineering",
    "dept.subtitle": "Computer Engineering Department",

    // Footer
    "footer.quickLinks": "Quick Links",
    "footer.aboutUs": "About Us",
    "footer.programs": "Programs",
    "footer.bachelor": "Bachelor's Program",
    "footer.master": "Master's Program",
    "footer.doctoral": "Doctoral Program",
    "footer.contact": "Contact",
    "footer.office": "Department Office",
    "footer.contactForm": "Contact Form",
    "footer.rights": "All rights reserved",
    "footer.excellence": "Excellence in Technology Education",
    "footer.studentInfoSystems": "Student Information Systems",
    "footer.ess": "Education Service System (ESS)",
    "footer.academicCalendar": "Academic Calendar",
    "footer.teachingEval": "Teaching Evaluation System",
    "footer.activityReg": "Activity Registration",
    "footer.ictIssue": "Report ICT Issues",
    "footer.opac": "Resource Search (OPAC)",

    // Homepage Focus Areas
    "home.focusArea1.title": "Programs & Curriculum",
    "home.focusArea1.desc":
      "Explore our modern curriculum and diverse study plans",
    "home.focusArea2.title": "Student Works & Projects",
    "home.focusArea2.desc":
      "Discover innovative projects and creative works by our students",
    "home.focusArea3.title": "Department Activities",
    "home.focusArea3.desc": "Stay updated with the latest news and events",

    // Homepage Hero
    "home.hero.title": "Computer Engineering",
    "home.hero.subtitle": "Where The Future Is Invented",
    "home.hero.description":
      "Focused on developing expertise in computer system architecture, software and information systems, network and cybersecurity, as well as the Internet of Things (IoT) and Artificial Intelligence (AI) applications — to create innovations that can be practically applied in industry and the digital society.",
    "home.hero.explorePrograms": "Explore Programs",
    "home.hero.aboutUs": "About Us",
    "home.hero.applyNow": "Apply Now",

    // About Page
    "about.hero.title": "About Our Department",
    "about.hero.subtitle":
      "Computer Engineering Program, Faculty of Engineering and Industrial Technology, Kalasin University",
    "about.mission.title": "Our Mission",
    "about.mission.text":
      "To provide world-class education in Computer Engineering, foster innovative research, and develop graduates who are technically proficient, ethically responsible, and globally competitive.",
    "about.vision.title": "Our Vision",
    "about.vision.text":
      "To be recognized as a leading Computer Engineering department that drives technological innovation, contributes to society, and produces graduates who shape the future of technology.",
    "about.stats.students": "Students",
    "about.stats.faculty": "Faculty",
    "about.stats.research": "Research Projects",
    "about.stats.years": "Years Excellence",
    "about.values.title": "Our Core Values",
    "about.values.excellence.title": "Excellence",
    "about.values.excellence.desc":
      "Striving for the highest standards in education and research",
    "about.values.innovation.title": "Innovation",
    "about.values.innovation.desc":
      "Fostering creativity and cutting-edge research",
    "about.values.collaboration.title": "Collaboration",
    "about.values.collaboration.desc":
      "Building partnerships for greater impact",
    "about.values.integrity.title": "Integrity",
    "about.values.integrity.desc": "Upholding ethical principles in all we do",
    "about.history.title": "Our History",
    "about.history.p1":
      "The Computer Engineering Program, Faculty of Engineering and Industrial Technology, Kalasin University, was established in 2015 as a result of the merger between the Computer Science Program of Rajamangala University of Technology Isan, Kalasin Campus, and the Computer Engineering Program of Kalasin Rajabhat University, following the consolidation of the two institutions to form Kalasin University.",
    "about.history.p2":
      "The program was founded with the goal of developing skilled computer engineering professionals with expertise in hardware, software, networking, and modern digital technologies, responding to the demands of industry and national development. The program emphasizes a balance between theoretical learning, hands-on practice, research, and academic service to the community.",

    // Faculty Page
    "faculty.hero.title": "Our Faculty",
    "faculty.hero.subtitle":
      "Meet our distinguished faculty members who are leading experts in their fields, dedicated to excellence in teaching and research.",

    // Academics Page
    "academics.hero.title": "Academic Programs",
    "academics.hero.description":
      "Discover our world-class Computer Engineering programs designed to prepare you for the challenges and opportunities of tomorrow.",
    "academics.level.bachelor": "Bachelor's Programs",
    "academics.level.master": "Master's Programs",
    "academics.level.doctoral": "Doctoral Programs",
    "academics.courses": "Courses",
    "academics.noPrograms": "No programs available at this time.",

    // Student Works Page
    "studentWorks.hero.title": "Student Works",
    "studentWorks.hero.description":
      "Discover the innovative projects and competition awards by our talented Computer Engineering students.",
    "studentWorks.filter.year": "Year",
    "studentWorks.filter.type": "Type",
    "studentWorks.filter.all": "All",
    "studentWorks.type.project": "Projects",
    "studentWorks.type.competition": "Competitions",
    "studentWorks.noResults":
      "No student works found matching the selected filters.",

    // News Page
    "news.title.all": "News & Events",
    "news.title.news": "News",
    "news.title.event": "Events",
    "news.desc.default":
      "Stay informed about the latest developments, achievements, and announcements.",
    "news.desc.event":
      "Upcoming and past events from the Computer Engineering Department.",
    "news.filter.all": "All",
    "news.filter.news": "News",
    "news.filter.event": "Events",
    "news.noResults": "No items available at this time.",

    // Homepage Sections
    "home.section.news": "News & Announcements",
    "home.section.events": "Events",
    "home.section.programs": "Our Programs",
    "home.section.faculty": "Our Faculty",
    "home.section.viewAll": "View All",
    "home.section.viewAllPrograms": "View All Programs",
    "home.section.noEvents": "No upcoming events",
    "home.section.eventBadge": "Event",

    // Contact Page
    "contact.title": "Contact Us",
    "contact.subtitle":
      "Have a question or want to learn more? We\u2019d love to hear from you.",
    "contact.getInTouch": "Get In Touch",
    "contact.address": "Address",
    "contact.addressLine1": "Computer Engineering Department",
    "contact.addressLine2": "Faculty of Engineering and Industrial Technology",
    "contact.addressLine3": "Kalasin University",
    "contact.viewMap": "View on Google Maps \u2192",
    "contact.email": "Email",
    "contact.facebook": "Facebook",
    "contact.messageOnFacebook": "Message Us on Facebook",
    "contact.officeHours": "Office Hours",
    "contact.officeHoursWeekday":
      "Monday \u2013 Friday: 8:30 AM \u2013 4:30 PM",
    "contact.officeHoursWeekend": "Saturday \u2013 Sunday: Closed",
    "contact.officeHoursNote": "* Closed on public holidays",
    "contact.sendMessage": "Send Us a Message",
    "contact.form.name": "Name",
    "contact.form.namePlaceholder": "Your full name",
    "contact.form.email": "Email",
    "contact.form.emailPlaceholder": "your.email@example.com",
    "contact.form.subject": "Subject",
    "contact.form.subjectPlaceholder": "What is this regarding?",
    "contact.form.message": "Message",
    "contact.form.messagePlaceholder": "Your message here...",
    "contact.form.success":
      "Thank you! Your message has been sent successfully.",
    "contact.form.error": "Failed to send message. Please try again.",
    "contact.form.sending": "Sending...",
    "contact.form.send": "Send Message",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "th" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.th] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
