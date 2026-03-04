# Computer Engineering Department Website

A modern, SEO-first departmental website built with Next.js 14+ (App Router), TypeScript, and PostgreSQL.

## Features

### ✨ Key Capabilities

- **SEO-Optimized**: Server-Side Rendering (SSR), Static Site Generation (SSG), and Incremental Static Regeneration (ISR)
- **Structured Data**: JSON-LD schemas for Organization, Person, Article, and BreadcrumbList
- **Dynamic Content**: Faculty profiles, academic programs, news & events, student works
- **Responsive Design**: Mobile-first, fully responsive UI with Tailwind CSS
- **Contact Form**: Server-side form handling with database storage

### 📑 Content Modules

1. **Faculty Directory** - Profiles with academic credentials, research interests, and publications
2. **Academic Programs** - Bachelor, Master, and Doctoral programs with detailed curriculum
3. **News & Events** - Latest announcements and upcoming events
4. **Student Works** - Showcase of student projects and research
5. **Static Pages** - About Us, Contact Us

## Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Framework          | Next.js 14+ (App Router) |
| Language           | TypeScript               |
| Database           | PostgreSQL 14+           |
| ORM                | Prisma                   |
| Styling            | Tailwind CSS             |
| Icons              | Lucide React             |
| Image Optimization | next/image               |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm/npm/yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ce2026
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/ce2026?schema=public
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up the database**

   ```bash
   # Run the SQL schema
   psql -U username -d ce2026 -f docs/DBSchema.sql

   # Generate Prisma Client
   npx prisma generate
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ce2026/
├── app/
│   ├── components/          # Reusable components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── faculty/             # Faculty module
│   │   ├── page.tsx         # Listing page
│   │   └── [slug]/page.tsx  # Detail page
│   ├── academics/           # Programs module
│   ├── news/                # News & Events module
│   ├── student-works/       # Student works module
│   ├── about/               # About page
│   ├── contact/             # Contact page with form
│   ├── api/                 # API routes
│   ├── sitemap.ts           # Dynamic sitemap
│   ├── robots.ts            # Robots.txt
│   └── layout.tsx           # Root layout
├── lib/
│   ├── db.ts                # Prisma client
│   ├── seo.ts               # SEO utilities
│   └── utils.ts             # Helper functions
├── prisma/
│   └── schema.prisma        # Database schema
└── docs/
    ├── DBSchema.sql         # Database schema SQL
    └── Departmental_Website_PRD.md
```

## SEO Features

### Meta Tags

- Dynamic `generateMetadata()` for each page
- Open Graph tags
- Twitter Card tags
- Canonical URLs

### Structured Data (JSON-LD)

- Organization schema (homepage)
- Person schema (faculty profiles)
- Article schema (news posts)
- BreadcrumbList schema (navigation)

### Sitemap & Robots

- Automatically generated XML sitemap
- robots.txt with proper crawl directives
- Dynamic URLs from database

## Rendering Strategies

| Page Type        | Strategy | Revalidation |
| ---------------- | -------- | ------------ |
| Homepage         | SSR      | On-demand    |
| Faculty Listing  | SSG      | Build time   |
| Faculty Detail   | SSG      | Build time   |
| Programs Listing | ISR      | 24 hours     |
| Program Detail   | ISR      | 24 hours     |
| News Listing     | ISR      | 1 hour       |
| News Detail      | ISR      | 1 hour       |
| Student Works    | SSG      | Build time   |
| Static Pages     | SSG      | Build time   |

## Database Schema

The application uses 4 PostgreSQL schemas:

- `academic` - Faculty, Programs, Courses
- `content` - Posts, Pages, Media, Student Works
- `system` - Users, Authentication
- `public` - Cross-schema references

See [prisma/schema.prisma](prisma/schema.prisma) for details.

## Performance Targets

- Google PageSpeed Performance ≥ 90
- Core Web Vitals:
  - LCP < 2.5 seconds
  - CLS < 0.1
  - INP < 200 ms

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Self-Hosted (Docker)

```bash
docker build -t ce2026 .
docker run -p 3000:3000 ce2026
```

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SITE_URL` - Public site URL

## Learn More

To learn more about Next.js:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

[Add your license here]

## Support

For issues and questions, please contact:

- Email: ce@university.ac.th
