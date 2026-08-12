-- 4Seas Coliving — schema for Supabase project kjvghylfjuvczzhmooyd.
-- Hand-written from lib/db/schema.ts (the project has no drizzle-kit and
-- no migrations folder). Idempotent: safe to re-run.
--
-- RLS NOTE — read before "simplifying" the last section away.
-- The app talks to Postgres directly over the session pooler as the
-- `postgres` role, which bypasses RLS entirely. But every Supabase project
-- also exposes PostgREST, where the `anon` key can read any table in
-- `public` that has RLS switched off. `applications` holds applicant
-- names, emails and IM handles, so leaving RLS off would republish exactly
-- the leak that had to be closed on the residency project in 2026-08.
-- Every table below therefore ends up: RLS enabled, zero policies, not
-- forced (so the owner role and its members keep working).

BEGIN;

CREATE TABLE IF NOT EXISTS public.applications (
  id                serial PRIMARY KEY,
  name              text NOT NULL,
  email             text NOT NULL,
  contact_method    text,
  im_contact        text,
  stay_duration     text,
  desired_check_in  text,
  room_preference   text,
  occupancy         text,
  room_note         text,
  current_project   text,
  vibe              text,
  status            text NOT NULL DEFAULT 'pending',
  check_in_date     text,
  check_out_date    text,
  room_assignment   text,
  contribution      text,
  internal_feedback text,
  tags              text,
  room_unit_id      integer,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.room_units (
  id            serial PRIMARY KEY,
  building      text NOT NULL,
  room_no       text NOT NULL,
  room_type     text NOT NULL,
  size_sqm      integer,
  bed_type      text,
  bathroom      text,
  pax           integer,
  special_notes text,
  bookable      boolean NOT NULL DEFAULT true,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.residents (
  id             serial PRIMARY KEY,
  room_unit_id   integer NOT NULL,
  name           text NOT NULL,
  category       text NOT NULL DEFAULT 'other',
  check_in_date  text,
  check_out_date text,
  amount         integer,
  amount_unit    text,
  paid           boolean NOT NULL DEFAULT false,
  payment_method text,
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.status_logs (
  id             serial PRIMARY KEY,
  application_id integer NOT NULL,
  from_status    text,
  to_status      text NOT NULL,
  email_sent     boolean NOT NULL DEFAULT false,
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id           serial PRIMARY KEY,
  slug         text NOT NULL UNIQUE,
  title        text NOT NULL,
  description  text,
  image_url    text,
  image_urls   text,
  single_price integer,
  double_price integer,
  status       text NOT NULL DEFAULT 'available',
  enabled      boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.email_templates (
  id      serial PRIMARY KEY,
  type    text NOT NULL UNIQUE,
  subject text NOT NULL,
  body    text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.guides (
  id         serial PRIMARY KEY,
  slug       text NOT NULL UNIQUE,
  title      text NOT NULL,
  content    text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lock every table away from the anon/authenticated PostgREST roles.
-- Enabled + zero policies = nothing gets through; NOT forced, so the
-- table owner (and any role granted it) still reads and writes normally.
ALTER TABLE public.applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_units      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings   ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verify (expect 8 rows, rowsecurity = t, forced = f, policies = 0):
--   SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity,
--          (SELECT count(*) FROM pg_policies p
--             WHERE p.schemaname = 'public' AND p.tablename = c.relname)
--     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--    WHERE n.nspname = 'public' AND c.relkind = 'r'
--    ORDER BY 1;
