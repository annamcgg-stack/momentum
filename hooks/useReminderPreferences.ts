"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import {
  DEFAULT_REMINDER_PREFERENCES,
  type UserReminderPreferences,
} from "@/lib/reminders/types";
import {
  mapReminderPrefsRow,
  reminderPrefsToDbUpsert,
  type ReminderPrefsRow,
} from "@/lib/supabase/reminder-prefs-mapper";

function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

export function useReminderPreferences(userId: string | null) {
  const [prefs, setPrefs] = useState<UserReminderPreferences | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setPrefs(null);
      setReady(true);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setPrefs(null);
      setReady(true);
      return;
    }

    const { data, error } = await supabase
      .from("user_reminder_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      setPrefs({
        userId,
        ...DEFAULT_REMINDER_PREFERENCES,
        timezone: detectTimeZone(),
        updatedAt: new Date().toISOString(),
      });
      setReady(true);
      return;
    }

    setPrefs(mapReminderPrefsRow(data as ReminderPrefsRow));
    setReady(true);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (patch: Partial<Omit<UserReminderPreferences, "userId" | "updatedAt">>) => {
      if (!userId) return { ok: false as const, error: "Not signed in" };

      const supabase = getSupabaseClient();
      if (!supabase) return { ok: false as const, error: "Supabase not configured" };

      const base: Omit<UserReminderPreferences, "userId" | "updatedAt"> = prefs
        ? {
            remindersEnabled: prefs.remindersEnabled,
            reminderTime: prefs.reminderTime,
            reminderFrequency: prefs.reminderFrequency,
            reminderTone: prefs.reminderTone,
            timezone: prefs.timezone,
          }
        : {
            ...DEFAULT_REMINDER_PREFERENCES,
            timezone: detectTimeZone(),
          };

      const next = { ...base, ...patch };
      const row = reminderPrefsToDbUpsert(userId, next);

      const { error } = await supabase
        .from("user_reminder_preferences")
        .upsert(row, { onConflict: "user_id" });

      if (error) return { ok: false as const, error: error.message };

      setPrefs({
        userId,
        ...next,
        updatedAt: row.updated_at,
      });
      return { ok: true as const };
    },
    [userId, prefs],
  );

  return {
    prefs,
    ready,
    reload: load,
    save,
    detectTimeZone,
  };
}
