"use client";

/**
 * In-app reminder tick: when the scheduled local minute matches, loads today’s row from Supabase
 * and fires the browser channel at most once per user per calendar day (in their timezone).
 * Does not share React state with useEntries — reads a fresh row each tick to stay accurate.
 */

import { useEffect, useRef } from "react";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { todayKey } from "@/lib/entry-utils";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import {
  mapRowToDailyEntry,
  type DailyEntryRow,
} from "@/lib/supabase/daily-entry-mapper";
import {
  browserReminderChannel,
  getReminderCopyForTone,
  isReminderMinute,
  reminderDayKey,
  shouldPromptCheckIn,
} from "@/lib/reminders";

const TICK_MS = 30_000;

export function ReminderCoordinator() {
  const { user } = useSupabaseUser();
  const userId = user?.id ?? null;
  const { prefs, ready } = useReminderPreferences(userId);
  const lastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !prefs?.remindersEnabled || !userId) return;

    async function tick() {
      const p = prefs;
      if (!p?.remindersEnabled) return;

      const now = new Date();
      if (!isReminderMinute(now, p)) return;

      const supabase = getSupabaseClient();
      if (!supabase) return;

      const day = reminderDayKey(now, p.timezone);
      const fireKey = `${userId}:${day}`;
      if (lastFiredRef.current === fireKey) return;

      const date = todayKey();
      const { data: row } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .maybeSingle();

      const entry = row
        ? mapRowToDailyEntry(row as DailyEntryRow, null)
        : undefined;

      if (!shouldPromptCheckIn(entry)) return;

      const copy = getReminderCopyForTone(p.reminderTone);
      lastFiredRef.current = fireKey;

      await browserReminderChannel.deliver({
        title: copy.title,
        body: copy.body,
        tag: `momentum-checkin-${day}`,
      });
    }

    const id = window.setInterval(() => {
      void tick();
    }, TICK_MS);
    void tick();
    return () => window.clearInterval(id);
  }, [ready, prefs, userId]);

  return null;
}
