/**
 * Channel abstraction — plug in browser notifications today; email / FCM later.
 */

export interface ReminderDeliveryPayload {
  title: string;
  body: string;
  /** Dedupes notifications in supporting environments */
  tag?: string;
}

export type ReminderChannelId = "browser" | "email" | "push";

export interface ReminderChannel {
  readonly id: ReminderChannelId;
  /** Whether this runtime can theoretically use this channel */
  isSupported(): boolean;
  /** Optional: browser Notification permission */
  requestPermission?(): Promise<NotificationPermission>;
  deliver(payload: ReminderDeliveryPayload): Promise<void>;
}
