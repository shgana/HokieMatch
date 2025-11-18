-- HokieMatch Postgres schema
-- Use in Supabase or standard Postgres. Includes keys, FKs, indexes.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- USERS
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_email on public.users (email);

-- COURSES
create table if not exists public.courses (
  id text primary key, -- e.g., CS 2114
  title text not null,
  description text,
  credits int not null default 3,
  pathways text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COURSE SECTIONS
create table if not exists public.course_sections (
  id uuid primary key default uuid_generate_v4(),
  course_id text not null references public.courses(id) on delete cascade,
  crn text,
  term text,
  instructors text[] default '{}',
  schedule jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_course_sections_course on public.course_sections (course_id);

-- INSTRUCTORS
create table if not exists public.instructors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  department text,
  normalized_name text generated always as (lower(regexp_replace(name, '\\s+', ' ', 'g'))) stored,
  created_at timestamptz not null default now()
);
create unique index if not exists idx_instructors_normalized on public.instructors(normalized_name);

-- GRADE DISTRIBUTIONS (from CSV)
create table if not exists public.grade_distributions (
  id uuid primary key default uuid_generate_v4(),
  course_id text not null references public.courses(id) on delete cascade,
  instructor_id uuid references public.instructors(id),
  term text,
  section text,
  a_count int default 0,
  b_count int default 0,
  c_count int default 0,
  d_count int default 0,
  f_count int default 0,
  w_count int default 0,
  total int generated always as (a_count + b_count + c_count + d_count + f_count + coalesce(w_count,0)) stored,
  avg_gpa numeric(3,2),
  created_at timestamptz not null default now()
);
create index if not exists idx_grade_distributions_course on public.grade_distributions(course_id);
create index if not exists idx_grade_distributions_instructor on public.grade_distributions(instructor_id);

-- PATHWAYS AREAS
create table if not exists public.pathways_areas (
  id text primary key, -- e.g., 6D, 1A, 5A, 7
  name text not null,
  category text not null,
  credits_required int not null default 3,
  description text,
  created_at timestamptz not null default now()
);

-- PATHWAYS COURSES (junction)
create table if not exists public.pathways_courses (
  id uuid primary key default uuid_generate_v4(),
  pathway_id text not null references public.pathways_areas(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  unique(pathway_id, course_id)
);
create index if not exists idx_pathways_courses_pathway on public.pathways_courses(pathway_id);

-- DARS REPORTS
create table if not exists public.dars_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  filename text,
  raw jsonb not null,
  parsed jsonb,
  hours_completed int default 0,
  hours_remaining int default 0,
  progress_percent numeric(5,2),
  created_at timestamptz not null default now()
);
create index if not exists idx_dars_user on public.dars_reports(user_id);

-- REQUIREMENTS
create table if not exists public.requirements (
  id uuid primary key default uuid_generate_v4(),
  dars_id uuid references public.dars_reports(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  group_name text not null,
  status text not null check (status in ('Completed', 'Remaining', 'InProgress')),
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_requirements_user on public.requirements(user_id);

-- COMPLETED COURSES
create table if not exists public.completed_courses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  term text,
  grade text,
  credits int,
  source text default 'dars',
  created_at timestamptz not null default now()
);
create index if not exists idx_completed_user on public.completed_courses(user_id);

-- REMAINING REQUIREMENTS (expanded rows)
create table if not exists public.remaining_requirements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  dars_id uuid references public.dars_reports(id) on delete cascade,
  requirement_id uuid references public.requirements(id) on delete cascade,
  course_options text[] not null default '{}',
  credits_needed int,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_remaining_user on public.remaining_requirements(user_id);

-- USER PICKS (wishlist)
create table if not exists public.user_picks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  note text,
  position int default 0,
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);
create index if not exists idx_picks_user on public.user_picks(user_id);

-- RECOMMENDATIONS CACHE
create table if not exists public.recommendations_cache (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  payload jsonb not null,
  generated_at timestamptz not null default now()
);
create index if not exists idx_recs_user on public.recommendations_cache(user_id);

-- VIEWS / MATERIALIZED VIEWS
create or replace view public.course_gpa_summary as
select
  course_id,
  avg(avg_gpa) as avg_gpa,
  avg(total) as avg_total,
  percentile_disc(0.5) within group (order by avg_gpa) as median_gpa
from public.grade_distributions
group by course_id;

create or replace view public.instructor_gpa_summary as
select
  instructor_id,
  avg(avg_gpa) as avg_gpa,
  count(*) as samples
from public.grade_distributions
group by instructor_id;

