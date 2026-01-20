-- Departmental Website Management System (PostgreSQL)
-- Recommended: PostgreSQL 14+
-- This script creates schemas + tables + indexes + basic FTS (full-text search) support.

BEGIN;

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive email

-- 1) Schemas (logical separation)
CREATE SCHEMA IF NOT EXISTS system;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS academic;

-- 2) Common helpers
-- Slug pattern constraint (optional but useful)
-- Slug examples: "ai-logistics-2026", "john-doe"
-- NOTE: adjust regex if you want to allow Thai slugs.
CREATE DOMAIN system.slug AS text
  CHECK (VALUE ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- 3) SYSTEM: users / auth (simple admin CMS)
CREATE TABLE IF NOT EXISTS system.users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           citext NOT NULL UNIQUE,
  password_hash   text NOT NULL, -- store bcrypt/argon2 hash (NEVER plain password)
  full_name       text NOT NULL,
  role            text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor')),
  is_active       boolean NOT NULL DEFAULT true,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION system.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON system.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON system.users
FOR EACH ROW EXECUTE FUNCTION system.set_updated_at();

-- 4) CONTENT: media assets (images, pdf, attachments)
CREATE TABLE IF NOT EXISTS content.media_assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path       text NOT NULL,         -- e.g., /uploads/2026/01/xxx.webp
  original_name   text,
  mime_type       text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes >= 0),
  width           int,
  height          int,
  alt_text        text,
  title_text      text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by      uuid REFERENCES system.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_mime ON content.media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON content.media_assets(created_at DESC);

-- 5) CONTENT: categories + tags
CREATE TABLE IF NOT EXISTS content.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        system.slug NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content.tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        system.slug NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 6) CONTENT: static pages (custom HTML allowed)
CREATE TABLE IF NOT EXISTS content.pages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  slug              system.slug NOT NULL UNIQUE,
  html_content      text NOT NULL, -- store sanitized HTML (server-side sanitize recommended)
  meta_title        text,
  meta_description  text,
  cover_image_id    uuid REFERENCES content.media_assets(id) ON DELETE SET NULL,
  is_published      boolean NOT NULL DEFAULT false,
  published_at      timestamptz,
  created_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  updated_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  -- Full-text search
  search_tsv         tsvector
);

DROP TRIGGER IF EXISTS trg_pages_updated_at ON content.pages;
CREATE TRIGGER trg_pages_updated_at
BEFORE UPDATE ON content.pages
FOR EACH ROW EXECUTE FUNCTION system.set_updated_at();

-- Update FTS vector for pages
CREATE OR REPLACE FUNCTION content.pages_set_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv :=
      setweight(to_tsvector('simple', coalesce(NEW.title,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.meta_title,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.html_content,'')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_pages_tsv ON content.pages;
CREATE TRIGGER trg_pages_tsv
BEFORE INSERT OR UPDATE OF title, meta_title, html_content ON content.pages
FOR EACH ROW EXECUTE FUNCTION content.pages_set_tsv();

CREATE INDEX IF NOT EXISTS idx_pages_published ON content.pages(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_tsv_gin ON content.pages USING gin(search_tsv);

-- 7) CONTENT: news & events
CREATE TABLE IF NOT EXISTS content.posts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text NOT NULL CHECK (type IN ('news','event')),
  title             text NOT NULL,
  slug              system.slug NOT NULL UNIQUE,
  excerpt           text,
  html_content      text NOT NULL,
  thumbnail_id      uuid REFERENCES content.media_assets(id) ON DELETE SET NULL,
  category_id       uuid REFERENCES content.categories(id) ON DELETE SET NULL,

  event_start_at    timestamptz, -- used if type='event'
  event_end_at      timestamptz,

  meta_title        text,
  meta_description  text,
  is_published      boolean NOT NULL DEFAULT false,
  published_at      timestamptz,

  created_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  updated_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  search_tsv        tsvector,

  -- Event validation (if one is set, ensure start <= end)
  CONSTRAINT chk_event_time
    CHECK (
      (event_start_at IS NULL AND event_end_at IS NULL)
      OR (event_start_at IS NOT NULL AND (event_end_at IS NULL OR event_start_at <= event_end_at))
    )
);

DROP TRIGGER IF EXISTS trg_posts_updated_at ON content.posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON content.posts
FOR EACH ROW EXECUTE FUNCTION system.set_updated_at();

-- FTS vector for posts
CREATE OR REPLACE FUNCTION content.posts_set_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv :=
      setweight(to_tsvector('simple', coalesce(NEW.title,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.excerpt,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.html_content,'')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_posts_tsv ON content.posts;
CREATE TRIGGER trg_posts_tsv
BEFORE INSERT OR UPDATE OF title, excerpt, html_content ON content.posts
FOR EACH ROW EXECUTE FUNCTION content.posts_set_tsv();

CREATE INDEX IF NOT EXISTS idx_posts_type_published ON content.posts(type, is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON content.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_tsv_gin ON content.posts USING gin(search_tsv);

-- Post <-> tags (many-to-many)
CREATE TABLE IF NOT EXISTS content.post_tags (
  post_id uuid NOT NULL REFERENCES content.posts(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES content.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 8) ACADEMIC: faculty directory
CREATE TABLE IF NOT EXISTS academic.faculty (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name_th        text,
  full_name_en        text NOT NULL,
  slug                system.slug NOT NULL UNIQUE,
  academic_position   text, -- e.g., Asst. Prof.
  job_title           text, -- e.g., Lecturer
  degrees             text, -- free text or JSONB if you want structured
  expertise_keywords  text, -- comma-separated or use faculty_tags table
  bio_html            text,
  email               citext,
  phone               text,
  office_location     text,
  profile_image_id    uuid REFERENCES content.media_assets(id) ON DELETE SET NULL,

  scholar_url         text,
  scopus_url          text,
  researchgate_url    text,
  orcid_url           text,

  meta_title          text,
  meta_description    text,

  is_published        boolean NOT NULL DEFAULT true,
  sort_order          int NOT NULL DEFAULT 0,

  created_by          uuid REFERENCES system.users(id) ON DELETE SET NULL,
  updated_by          uuid REFERENCES system.users(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  search_tsv          tsvector
);

DROP TRIGGER IF EXISTS trg_faculty_updated_at ON academic.faculty;
CREATE TRIGGER trg_faculty_updated_at
BEFORE UPDATE ON academic.faculty
FOR EACH ROW EXECUTE FUNCTION system.set_updated_at();

CREATE OR REPLACE FUNCTION academic.faculty_set_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv :=
      setweight(to_tsvector('simple', coalesce(NEW.full_name_en,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.full_name_th,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.academic_position,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.job_title,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.expertise_keywords,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.bio_html,'')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_faculty_tsv ON academic.faculty;
CREATE TRIGGER trg_faculty_tsv
BEFORE INSERT OR UPDATE OF full_name_en, full_name_th, academic_position, job_title, expertise_keywords, bio_html
ON academic.faculty
FOR EACH ROW EXECUTE FUNCTION academic.faculty_set_tsv();

CREATE INDEX IF NOT EXISTS idx_faculty_published_order ON academic.faculty(is_published, sort_order, full_name_en);
CREATE INDEX IF NOT EXISTS idx_faculty_tsv_gin ON academic.faculty USING gin(search_tsv);

-- 9) ACADEMIC: programs + curriculum files + courses
CREATE TABLE IF NOT EXISTS academic.programs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level             text NOT NULL CHECK (level IN ('bachelor','master','doctoral')),
  name_th           text,
  name_en           text NOT NULL,
  slug              system.slug NOT NULL UNIQUE,
  overview_html     text,
  study_plan_html   text, -- optional: table HTML or embed
  meta_title        text,
  meta_description  text,
  is_published      boolean NOT NULL DEFAULT true,
  sort_order        int NOT NULL DEFAULT 0,
  created_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  updated_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  search_tsv        tsvector
);

DROP TRIGGER IF EXISTS trg_programs_updated_at ON academic.programs;
CREATE TRIGGER trg_programs_updated_at
BEFORE UPDATE ON academic.programs
FOR EACH ROW EXECUTE FUNCTION system.set_updated_at();

CREATE OR REPLACE FUNCTION academic.programs_set_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv :=
      setweight(to_tsvector('simple', coalesce(NEW.name_en,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.name_th,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.overview_html,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.study_plan_html,'')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_programs_tsv ON academic.programs;
CREATE TRIGGER trg_programs_tsv
BEFORE INSERT OR UPDATE OF name_en, name_th, overview_html, study_plan_html
ON academic.programs
FOR EACH ROW EXECUTE FUNCTION academic.programs_set_tsv();

CREATE INDEX IF NOT EXISTS idx_programs_published_order ON academic.programs(is_published, sort_order, level);
CREATE INDEX IF NOT EXISTS idx_programs_tsv_gin ON academic.programs USING gin(search_tsv);

-- Curriculum downloadable files (PDF etc.)
CREATE TABLE IF NOT EXISTS academic.program_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    uuid NOT NULL REFERENCES academic.programs(id) ON DELETE CASCADE,
  title         text NOT NULL,
  file_id       uuid NOT NULL REFERENCES content.media_assets(id) ON DELETE RESTRICT,
  file_type     text NOT NULL DEFAULT 'pdf', -- e.g., pdf, docx
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_files_program ON academic.program_files(program_id, sort_order);

-- Courses (optional granularity)
CREATE TABLE IF NOT EXISTS academic.courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    uuid REFERENCES academic.programs(id) ON DELETE SET NULL,
  course_code   text,
  course_name_th text,
  course_name_en text NOT NULL,
  description_html text,
  credits       numeric(3,1),
  year_no       int,    -- year 1..4
  term_no       int,    -- term 1..3
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_courses_updated_at ON academic.courses;
CREATE TRIGGER trg_courses_updated_at
BEFORE UPDATE ON academic.courses
FOR EACH ROW EXECUTE FUNCTION system.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_courses_program ON academic.courses(program_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON academic.courses(course_code);

-- 10) CONTENT: student portfolios
CREATE TABLE IF NOT EXISTS content.student_works (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  slug              system.slug NOT NULL UNIQUE,
  academic_year     int NOT NULL CHECK (academic_year BETWEEN 2000 AND 2100),
  work_type         text NOT NULL DEFAULT 'project'
                    CHECK (work_type IN ('project','research','competition','internship','other')),
  summary           text,
  html_content      text,
  cover_image_id    uuid REFERENCES content.media_assets(id) ON DELETE SET NULL,
  meta_title        text,
  meta_description  text,
  is_published      boolean NOT NULL DEFAULT false,
  published_at      timestamptz,
  created_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  updated_by        uuid REFERENCES system.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  search_tsv        tsvector
);

DROP TRIGGER IF EXISTS trg_student_works_updated_at ON content.student_works;
CREATE TRIGGER trg_student_works_updated_at
BEFORE UPDATE ON content.student_works
FOR EACH ROW EXECUTE FUNCTION system.set_updated_at();

CREATE OR REPLACE FUNCTION content.student_works_set_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv :=
      setweight(to_tsvector('simple', coalesce(NEW.title,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.summary,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.html_content,'')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_student_works_tsv ON content.student_works;
CREATE TRIGGER trg_student_works_tsv
BEFORE INSERT OR UPDATE OF title, summary, html_content ON content.student_works
FOR EACH ROW EXECUTE FUNCTION content.student_works_set_tsv();

CREATE INDEX IF NOT EXISTS idx_student_works_published ON content.student_works(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_works_year_type ON content.student_works(academic_year DESC, work_type);
CREATE INDEX IF NOT EXISTS idx_student_works_tsv_gin ON content.student_works USING gin(search_tsv);

-- Student work attachments (multiple images/files per work)
CREATE TABLE IF NOT EXISTS content.student_work_assets (
  work_id uuid NOT NULL REFERENCES content.student_works(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES content.media_assets(id) ON DELETE RESTRICT,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  PRIMARY KEY (work_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_student_work_assets_order ON content.student_work_assets(work_id, sort_order);

-- 11) CONTACT: messages from contact form
CREATE TABLE IF NOT EXISTS content.contact_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         citext NOT NULL,
  subject       text,
  message       text NOT NULL,
  ip_address    inet,
  user_agent    text,
  status        text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','archived')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON content.contact_messages(status, created_at DESC);

-- 12) Optional: unified site search view (posts + pages + faculty + programs + student works)
-- You can query each table separately in PHP, but this view helps if you want a single search endpoint.
CREATE OR REPLACE VIEW content.site_search AS
  SELECT
    'post'::text AS entity,
    p.id,
    p.title,
    p.slug::text AS slug,
    p.published_at AS published_at,
    p.search_tsv AS tsv
  FROM content.posts p
  WHERE p.is_published = true

  UNION ALL
  SELECT
    'page'::text AS entity,
    pg.id,
    pg.title,
    pg.slug::text AS slug,
    pg.published_at AS published_at,
    pg.search_tsv AS tsv
  FROM content.pages pg
  WHERE pg.is_published = true

  UNION ALL
  SELECT
    'faculty'::text AS entity,
    f.id,
    COALESCE(f.full_name_en, f.full_name_th) AS title,
    f.slug::text AS slug,
    NULL::timestamptz AS published_at,
    f.search_tsv AS tsv
  FROM academic.faculty f
  WHERE f.is_published = true

  UNION ALL
  SELECT
    'program'::text AS entity,
    pr.id,
    pr.name_en AS title,
    pr.slug::text AS slug,
    NULL::timestamptz AS published_at,
    pr.search_tsv AS tsv
  FROM academic.programs pr
  WHERE pr.is_published = true

  UNION ALL
  SELECT
    'student_work'::text AS entity,
    sw.id,
    sw.title,
    sw.slug::text AS slug,
    sw.published_at AS published_at,
    sw.search_tsv AS tsv
  FROM content.student_works sw
  WHERE sw.is_published = true;

COMMIT;
