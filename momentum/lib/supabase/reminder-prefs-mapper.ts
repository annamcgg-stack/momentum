/** Map Supabase row ↔ app reminder preferences */

import type { ReminderFrequency, ReminderTone, UserReminderPreferences } from "@/lib/reminders/types";

export type ReminderPrefsRow = {
  user_id: string;
  reminders_enabled: boolean;
  reminder_time: string;
  reminder_frequency: string;
  reminder_tone: string;
  timezone: string;
  updated_at: string;
};

export function mapReminderPrefsRow(row: ReminderPrefsRow): UserReminderPreferences {
  return {
    userId: row.user_id,
    remindersEnabled: row.reminders_enabled,
    reminderTime: row.reminder_time,
    reminderFrequency: row.reminder_frequency as ReminderFrequency,
    reminderTone: row.reminder_tone as ReminderTone,
    timezone: row.timezone,
    updatedAt: row.updated_at,
  };
}

export function reminderPrefsToDbUpsert(
  userId: string,
  prefs: Omit<UserReminderPreferences, "userId" | "updatedAt">,
) {
  return {
    user_id: userId,
    reminders_enabled: prefs.remindersEnabled,
    reminder_time: prefs.reminderTime,
    reminder_frequency: prefs.reminderFrequency,
    reminder_tone: prefs.reminderTone,
    timezone: prefs.timezone,
    updated_at: new Date().toISOString(),
  };
}
