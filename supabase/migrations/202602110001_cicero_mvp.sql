-- Cicero MVP schema
create extension if not exists "pgcrypto";

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null,
  key_arguments text[] not null default '{}',
  objections text[] not null default '{}',
  key_terms jsonb not null default '[]'::jsonb,
  references_text text[] not null default '{}',
  body_markdown text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists public.virtues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text not null,
  deficiency_label text,
  excess_label text,
  default_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_virtues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  virtue_id uuid references public.virtues(id) on delete set null,
  custom_name text,
  custom_description text,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  check ((virtue_id is not null) <> (custom_name is not null)),
  unique (user_id, virtue_id)
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  acted_well text,
  fell_short text,
  rationalized text,
  correction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.entry_scores (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.daily_entries(id) on delete cascade,
  user_virtue_id uuid not null references public.user_virtues(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, user_virtue_id)
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  weekly_reflection text,
  resolution text,
  focus_virtue_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- Optional profile extension if profiles table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
      ADD COLUMN IF NOT EXISTS checkin_time time;
  END IF;
END $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_daily_entries_updated_at on public.daily_entries;
create trigger trg_daily_entries_updated_at
before update on public.daily_entries
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_entry_scores_updated_at on public.entry_scores;
create trigger trg_entry_scores_updated_at
before update on public.entry_scores
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_weekly_reviews_updated_at on public.weekly_reviews;
create trigger trg_weekly_reviews_updated_at
before update on public.weekly_reviews
for each row execute procedure public.set_updated_at();

alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.virtues enable row level security;
alter table public.user_virtues enable row level security;
alter table public.daily_entries enable row level security;
alter table public.entry_scores enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.lesson_progress enable row level security;

-- System tables are readable by authenticated users only.
drop policy if exists "modules_read" on public.modules;
create policy "modules_read" on public.modules
for select to authenticated using (true);

drop policy if exists "lessons_read" on public.lessons;
create policy "lessons_read" on public.lessons
for select to authenticated using (true);

drop policy if exists "virtues_read" on public.virtues;
create policy "virtues_read" on public.virtues
for select to authenticated using (true);

-- User scoped tables

drop policy if exists "user_virtues_select_own" on public.user_virtues;
create policy "user_virtues_select_own" on public.user_virtues
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "user_virtues_insert_own" on public.user_virtues;
create policy "user_virtues_insert_own" on public.user_virtues
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "user_virtues_update_own" on public.user_virtues;
create policy "user_virtues_update_own" on public.user_virtues
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_virtues_delete_own" on public.user_virtues;
create policy "user_virtues_delete_own" on public.user_virtues
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "daily_entries_select_own" on public.daily_entries;
create policy "daily_entries_select_own" on public.daily_entries
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "daily_entries_insert_own" on public.daily_entries;
create policy "daily_entries_insert_own" on public.daily_entries
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "daily_entries_update_own" on public.daily_entries;
create policy "daily_entries_update_own" on public.daily_entries
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "entry_scores_select_own" on public.entry_scores;
create policy "entry_scores_select_own" on public.entry_scores
for select to authenticated using (
  exists (
    select 1
    from public.daily_entries de
    where de.id = entry_id and de.user_id = auth.uid()
  )
);

drop policy if exists "entry_scores_insert_own" on public.entry_scores;
create policy "entry_scores_insert_own" on public.entry_scores
for insert to authenticated with check (
  exists (
    select 1
    from public.daily_entries de
    join public.user_virtues uv on uv.id = user_virtue_id
    where de.id = entry_id and de.user_id = auth.uid() and uv.user_id = auth.uid()
  )
);

drop policy if exists "entry_scores_update_own" on public.entry_scores;
create policy "entry_scores_update_own" on public.entry_scores
for update to authenticated using (
  exists (
    select 1
    from public.daily_entries de
    where de.id = entry_id and de.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.daily_entries de
    join public.user_virtues uv on uv.id = user_virtue_id
    where de.id = entry_id and de.user_id = auth.uid() and uv.user_id = auth.uid()
  )
);

drop policy if exists "entry_scores_delete_own" on public.entry_scores;
create policy "entry_scores_delete_own" on public.entry_scores
for delete to authenticated using (
  exists (
    select 1 from public.daily_entries de where de.id = entry_id and de.user_id = auth.uid()
  )
);

drop policy if exists "weekly_reviews_select_own" on public.weekly_reviews;
create policy "weekly_reviews_select_own" on public.weekly_reviews
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "weekly_reviews_insert_own" on public.weekly_reviews;
create policy "weekly_reviews_insert_own" on public.weekly_reviews
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "weekly_reviews_update_own" on public.weekly_reviews;
create policy "weekly_reviews_update_own" on public.weekly_reviews
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "lesson_progress_select_own" on public.lesson_progress;
create policy "lesson_progress_select_own" on public.lesson_progress
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "lesson_progress_insert_own" on public.lesson_progress;
create policy "lesson_progress_insert_own" on public.lesson_progress
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "lesson_progress_delete_own" on public.lesson_progress;
create policy "lesson_progress_delete_own" on public.lesson_progress
for delete to authenticated using (auth.uid() = user_id);
