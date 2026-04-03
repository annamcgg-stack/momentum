/**
 * Pure reminder evaluation — safe for unit tests and future server cron jobs.
 * No browser APIs here.
 */

import type { UserReminderPreferences } from "./types";
import type { DailyEntry } from "@/lib/types";
import { completionFraction } from "@/lib/entry-utils";

/** "09:05" style clock in the user's IANA timezone */
export function formatClockInTimeZone(date: Date, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export function isReminderMinute(
  now: Date,
  prefs: Pick<UserReminderPreferences, "reminderTime" | "timezone">,
): boolean {
  return formatClockInTimeZone(now, prefs.timezone) === prefs.reminderTime;
}

/**
 * Skip nudge if they’ve already done a solid check-in today (tunable).
 */
export function shouldPromptCheckIn(entry: DailyEntry | undefined): boolean {
  if (!entry) return true;
  return completionFraction(entry) < 0.45;
}

/**
 * Stable key for “fired once per local calendar day” in the user’s timezone.
 */
export function reminderDayKey(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
