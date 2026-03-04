import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ce.ksu.ac.th';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/faculty`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/academics`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/student-works`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Faculty pages
  const faculty = await prisma.faculty.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true },
  });

  type FacultyEntry = (typeof faculty)[number];
  const facultyPages = faculty.map((member: FacultyEntry) => ({
    url: `${SITE_URL}/faculty/${member.slug}`,
    lastModified: member.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Programs pages
  const programs = await prisma.programs.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true },
  });

  type ProgramEntry = (typeof programs)[number];
  const programPages = programs.map((program: ProgramEntry) => ({
    url: `${SITE_URL}/academics/${program.slug}`,
    lastModified: program.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // News pages
  const posts = await prisma.posts.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true },
    orderBy: { published_at: 'desc' },
    take: 500,
  });

  type PostEntry = (typeof posts)[number];
  const newsPages = posts.map((post: PostEntry) => ({
    url: `${SITE_URL}/news/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Student works pages
  const works = await prisma.student_works.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true },
    take: 200,
  });

  type WorkEntry = (typeof works)[number];
  const workPages = works.map((work: WorkEntry) => ({
    url: `${SITE_URL}/student-works/${work.slug}`,
    lastModified: work.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...facultyPages, ...programPages, ...newsPages, ...workPages];
}
