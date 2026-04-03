/**
 * All user-visible reminder copy lives here for easy edits, tone variants, and localization later.
 * Switch tone via DB `reminder_tone` → passed into these helpers.
 */

import type { ReminderTone } from "./types";

export const REMINDER_APP_NAME = "Momentum";

export interface ReminderCopy {
  /** Browser / push title (short) */
  title: string;
  /** Body line */
  body: string;
}

const toneCopy: Record<ReminderTone, ReminderCopy> = {
  gentle: {
    title: "A quiet nudge",
    body: "When you’re ready, your check-in only takes a minute — no pressure, just presence.",
  },
  motivating: {
    title: "Build your streak",
    body: "Small daily check-ins compound. Tap in and keep your momentum going today.",
  },
  accountability: {
    title: "Check-in time",
    body: "You chose consistency — log today’s check-in and stay on track with your goals.",
  },
};

export function getReminderCopyForTone(tone: ReminderTone): ReminderCopy {
  return toneCopy[tone] ?? toneCopy.gentle;
}

/** Settings page explainer per tone */
export function getToneDescription(tone: ReminderTone): string {
  switch (tone) {
    case "gentle":
      return "Soft, low-pressure language.";
    case "motivating":
      return "Encouraging, forward-looking.";
    case "accountability":
      return "Direct, commitment-focused.";
    default:
      return "";
  }
}
