/**
 * Reminder preferences — mirrors `public.user_reminder_preferences` (see migration 003).
 */

export type ReminderFrequency = "daily";

export type ReminderTone = "gentle" | "motivating" | "accountability";

export interface UserReminderPreferences {
  userId: string;
  remindersEnabled: boolean;
  /** 24h HH:mm in user's timezone */
  reminderTime: string;
  reminderFrequency: ReminderFrequency;
  reminderTone: ReminderTone;
  /** IANA timezone */
  timezone: string;
  updatedAt: string;
}

/** Defaults when no DB row exists yet */
export const DEFAULT_REMINDER_PREFERENCES: Omit<
  UserReminderPreferences,
  "userId" | "updatedAt"
> = {
  remindersEnabled: false,
  reminderTime: "09:00",
  reminderFrequency: "daily",
  reminderTone: "gentle",
  timezone: "UTC",
};
