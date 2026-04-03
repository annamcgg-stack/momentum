/**
 * Browser Notification API — works when the tab/app has permission; not a substitute for push.
 */

import type { ReminderChannel } from "./types";

export const browserReminderChannel: ReminderChannel = {
  id: "browser",
  isSupported() {
    return typeof window !== "undefined" && "Notification" in window;
  },
  async requestPermission() {
    if (!this.isSupported()) return "denied";
    return Notification.requestPermission();
  },
  async deliver(payload) {
    if (!this.isSupported()) return;
    if (Notification.permission !== "granted") return;
    // eslint-disable-next-line no-new
    new Notification(payload.title, {
      body: payload.body,
      tag: payload.tag ?? "momentum-daily-check-in",
    });
  },
};
