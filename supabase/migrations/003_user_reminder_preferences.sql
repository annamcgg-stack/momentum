-- Per-user reminder preferences (cross-device). Drives future push/email/browser delivery.

create table if not exists public.user_reminder_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,

  reminders_enabled boolean not null default false,
  -- Local wall-clock time in user's timezone, 24h HH:MM
  reminder_time text not null default '09:00'
    check (reminder_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),

  reminder_frequency text not null default 'daily'
    check (reminder_frequency in ('daily')),
  -- Copy pack for generated reminder text
  reminder_tone text not null default 'gentle'
    check (reminder_tone in ('gentle', 'motivating', 'accountability')),

  -- IANA zone e.g. Europe/London (used when evaluating "local" reminder_time)
  timezone text not null default 'UTC',

  updated_at timestamptz not null default now()
);

comment on table public.user_reminder_preferences is 'Notification/reminder settings; one row per authenticated user.';
comment on column public.user_reminder_preferences.reminder_frequency is 'Extensible: daily now; add weekly/custom later.';
comment on column public.user_reminder_preferences.reminder_tone is 'Selects messaging style in lib/reminders/messages.ts';

alter table public.user_reminder_preferences enable row level security;

create policy "reminder_prefs_select_own"
  on public.user_reminder_preferences
  for select
  using (auth.uid() = user_id);

create policy "reminder_prefs_insert_own"
  on public.user_reminder_preferences
  for insert
  with check (auth.uid() = user_id);

create policy "reminder_prefs_update_own"
  on public.user_reminder_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reminder_prefs_delete_own"
  on public.user_reminder_preferences
  for delete
  using (auth.uid() = user_id);
