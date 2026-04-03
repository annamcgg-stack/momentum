-- Momentum (MVP) schema for Supabase
-- Run this SQL in your Supabase project (SQL Editor).

-- 1) Daily entries table (RLS protected)
create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,

  workout_completed boolean not null default false,
  workout_type text not null default '',
  workout_intensity text check (workout_intensity in ('low','medium','high')) ,

  sleep_hours real,
  sleep_quality integer,
  steps integer,
  mood integer,
  water_oz real,
  notes text not null default '',

  -- Storage object key (path inside the bucket). Example:
  -- <user_id>/<YYYY-MM-DD>.jpg
  progress_photo_path text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure one entry per day per user.
create unique index if not exists daily_entries_user_date_uq
  on public.daily_entries(user_id, date);

alter table public.daily_entries enable row level security;

create policy "daily_entries_select_own"
  on public.daily_entries
  for select
  using (auth.uid() = user_id);

create policy "daily_entries_insert_own"
  on public.daily_entries
  for insert
  with check (auth.uid() = user_id);

create policy "daily_entries_update_own"
  on public.daily_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_entries_delete_own"
  on public.daily_entries
  for delete
  using (auth.uid() = user_id);

-- 2) Storage bucket for progress photos
-- Bucket is private by default.
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Storage security: only allow access to objects whose first path segment is the user id.
alter table storage.objects enable row level security;

create policy "progress_photos_select_own"
  on storage.objects
  for select
  using (bucket_id = 'progress-photos' and split_part(name, '/', 1) = auth.uid()::text);

create policy "progress_photos_insert_own"
  on storage.objects
  for insert
  with check (bucket_id = 'progress-photos' and split_part(name, '/', 1) = auth.uid()::text);

create policy "progress_photos_update_own"
  on storage.objects
  for update
  using (bucket_id = 'progress-photos' and split_part(name, '/', 1) = auth.uid()::text)
  with check (bucket_id = 'progress-photos' and split_part(name, '/', 1) = auth.uid()::text);

create policy "progress_photos_delete_own"
  on storage.objects
  for delete
  using (bucket_id = 'progress-photos' and split_part(name, '/', 1) = auth.uid()::text);

