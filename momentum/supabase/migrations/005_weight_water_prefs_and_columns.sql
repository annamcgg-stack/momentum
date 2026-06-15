-- Performance-first optional features:
-- 1) Optional weight tracking
-- 2) Water unit preference (store standardized water in ml internally)

-- Daily entries: add weight + standardized hydration (ml)
alter table public.daily_entries
  add column if not exists weight_kg real check (weight_kg is null or (weight_kg >= 20 and weight_kg <= 500)),
  add column if not exists water_intake_ml real;

-- Backfill standardized ml from existing values.
-- Assumption: existing `water_intake` (written from legacy water_oz) is in ounces.
update public.daily_entries
set water_intake_ml = water_intake * 29.5735
where water_intake_ml is null
  and water_intake is not null;

-- If `water_intake` is null but legacy `water_oz` exists, convert it too.
update public.daily_entries
set water_intake_ml = water_oz * 29.5735
where water_intake_ml is null
  and water_oz is not null;

-- Per-user preferences: weight tracking toggle + water unit preference
alter table public.user_profile_preferences
  add column if not exists weight_tracking_enabled boolean not null default false,
  add column if not exists water_unit text not null default 'oz'
    check (water_unit in ('ml','oz'));

