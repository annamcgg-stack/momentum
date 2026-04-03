/**
 * Future: Web Push (service worker + VAPID) or native mobile push via FCM/APNs.
 */

import type { ReminderChannel } from "./types";

export const pushReminderChannel: ReminderChannel = {
  id: "push",
  isSupported() {
    return false;
  },
  async deliver() {
    console.info("[momentum] mobile/web push not wired yet");
  },
};
