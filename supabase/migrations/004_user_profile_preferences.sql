-- Per-user profile preferences for personalization / premium insights.
-- Includes cycle tracking enablement gate for UI + future insights.

create table if not exists public.user_profile_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- Optional public-ish name used in UI
  display_name text,

  -- Master toggle: whether cycle-related fields should be shown
  cycle_tracking_enabled boolean not null default false,

  -- Optional physiology label used when cycle tracking is enabled
  -- Stored as free text for flexibility (no “medical” validation yet).
  sex text,

  -- Optional personalization / focus area for future insight explanations
  goal_focus text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profile_preferences enable row level security;

create policy "user_profile_preferences_select_own"
  on public.user_profile_preferences
  for select
  using (auth.uid() = user_id);

create policy "user_profile_preferences_insert_own"
  on public.user_profile_preferences
  for insert
  with check (auth.uid() = user_id);

create policy "user_profile_preferences_update_own"
  on public.user_profile_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_profile_preferences_delete_own"
  on public.user_profile_preferences
  for delete
  using (auth.uid() = user_id);

