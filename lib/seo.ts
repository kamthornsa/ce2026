import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}

const SITE_NAME = 'Computer Engineering Department';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ce.university.ac.th';

export function generateSEO({
  title,
  description,
  path = '',
  image = '/og-image.jpg',
  type = 'website',
}: SEOProps): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Leading Computer Engineering education and research',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TH',
    },
  };
}

export function generatePersonSchema(faculty: {
  full_name_en: string;
  slug: string;
  academic_position?: string | null;
  expertise_keywords?: string | null;
  email?: string | null;
  scholar_url?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: faculty.full_name_en,
    url: `${SITE_URL}/faculty/${faculty.slug}`,
    jobTitle: faculty.academic_position || undefined,
    knowsAbout: faculty.expertise_keywords?.split(',').map(k => k.trim()) || undefined,
    email: faculty.email || undefined,
    sameAs: faculty.scholar_url ? [faculty.scholar_url] : undefined,
  };
}

export function generateArticleSchema(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  published_at?: Date | null;
  updated_at: Date;
  thumbnail_id?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    url: `${SITE_URL}/news/${post.slug}`,
    description: post.excerpt || undefined,
    datePublished: post.published_at?.toISOString(),
    dateModified: post.updated_at.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
