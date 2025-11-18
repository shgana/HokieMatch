-- 0002_rls_policies.sql
-- Enable RLS and define owner-based policies for all user-owned tables

-- Enable RLS on user-owned tables
alter table public.dars_reports enable row level security;
alter table public.completed_courses enable row level security;
alter table public.remaining_requirements enable row level security;
alter table public.user_picks enable row level security;
alter table public.recommendations_cache enable row level security;

-- Owner-based policies for dars_reports
create policy "dars_reports_select" on public.dars_reports
  for select using (auth.uid() = user_id);

create policy "dars_reports_insert" on public.dars_reports
  for insert with check (auth.uid() = user_id);

create policy "dars_reports_update" on public.dars_reports
  for update using (auth.uid() = user_id);

create policy "dars_reports_delete" on public.dars_reports
  for delete using (auth.uid() = user_id);

-- Owner-based policies for completed_courses
create policy "completed_courses_select" on public.completed_courses
  for select using (auth.uid() = user_id);

create policy "completed_courses_insert" on public.completed_courses
  for insert with check (auth.uid() = user_id);

create policy "completed_courses_update" on public.completed_courses
  for update using (auth.uid() = user_id);

create policy "completed_courses_delete" on public.completed_courses
  for delete using (auth.uid() = user_id);

-- Owner-based policies for remaining_requirements
create policy "remaining_requirements_select" on public.remaining_requirements
  for select using (auth.uid() = user_id);

create policy "remaining_requirements_insert" on public.remaining_requirements
  for insert with check (auth.uid() = user_id);

create policy "remaining_requirements_update" on public.remaining_requirements
  for update using (auth.uid() = user_id);

create policy "remaining_requirements_delete" on public.remaining_requirements
  for delete using (auth.uid() = user_id);

-- Owner-based policies for user_picks
create policy "user_picks_select" on public.user_picks
  for select using (auth.uid() = user_id);

create policy "user_picks_insert" on public.user_picks
  for insert with check (auth.uid() = user_id);

create policy "user_picks_update" on public.user_picks
  for update using (auth.uid() = user_id);

create policy "user_picks_delete" on public.user_picks
  for delete using (auth.uid() = user_id);

-- Owner-based policies for recommendations_cache
create policy "recommendations_cache_select" on public.recommendations_cache
  for select using (auth.uid() = user_id);

create policy "recommendations_cache_insert" on public.recommendations_cache
  for insert with check (auth.uid() = user_id);

create policy "recommendations_cache_update" on public.recommendations_cache
  for update using (auth.uid() = user_id);

create policy "recommendations_cache_delete" on public.recommendations_cache
  for delete using (auth.uid() = user_id);
