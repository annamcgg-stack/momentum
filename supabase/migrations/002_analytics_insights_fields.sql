-- Expand daily_entries for future premium analytics / insights.
-- Run in Supabase SQL Editor after 001_momentum.sql.

-- Raw user-input fields (analytics-ready)
alter table public.daily_entries
  add column if not exists energy integer check (energy is null or (energy >= 1 and energy <= 5)),
  add column if not exists water_intake real,
  add column if not exists progress_photo_url text,
  add column if not exists stress_level integer check (stress_level is null or (stress_level >= 1 and stress_level <= 5)),
  add column if not exists soreness_level integer check (soreness_level is null or (soreness_level >= 1 and soreness_level <= 5)),
  add column if not exists rest_day boolean not null default false,
  add column if not exists cycle_phase text;

comment on column public.daily_entries.energy is 'User 1–5 energy rating (separate from mood).';
comment on column public.daily_entries.water_intake is 'User water intake; unit chosen by product (e.g. oz or ml).';
comment on column public.daily_entries.progress_photo_url is 'Optional denormalized public/static URL; canonical file is progress_photo_path.';
comment on column public.daily_entries.stress_level is 'User 1–5 stress.';
comment on column public.daily_entries.soreness_level is 'User 1–5 soreness / muscle load.';
comment on column public.daily_entries.rest_day is 'Explicit rest day flag for recovery analytics.';
comment on column public.daily_entries.cycle_phase is 'Optional cycle phase label for future hormone-aware insights.';

-- Backfill water_intake from legacy water_oz where missing
update public.daily_entries
set water_intake = water_oz
where water_intake is null and water_oz is not null;
