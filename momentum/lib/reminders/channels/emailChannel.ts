/**
 * Future: call Supabase Edge Function, Resend, Postmark, etc.
 */

import type { ReminderChannel } from "./types";

export const emailReminderChannel: ReminderChannel = {
  id: "email",
  isSupported() {
    return false;
  },
  async deliver() {
    console.info("[momentum] email reminders not wired yet");
  },
};
