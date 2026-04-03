"use client";

/**
 * Supabase-backed hook (MVP).
 * Loads the signed-in user's daily entries and persists updates to Postgres + storage.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyEntry } from "@/lib/types";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import { todayKey } from "@/lib/entry-utils";
import { emptyEntry, mergeEntry } from "@/lib/entry-utils";
import {
  dailyEntryToDbPayload,
  mapRowToDailyEntry,
  type DailyEntryRow,
} from "@/lib/supabase/daily-entry-mapper";

type EntriesMap = Record<string, DailyEntry>;

export function useEntries() {
  const [map, setMap] = useState<EntriesMap>({});
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setReady(false);

      const supabase = getSupabaseClient();
      if (!supabase) {
        setReady(true);
        return;
      }

      const { data: sessionData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        if (!mounted) return;
        setMap({});
        setReady(true);
        return;
      }

      const uid = sessionData.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setReady(true);
        return;
      }

      // Fetch last ~400 days so History has enough coverage.
      const from = new Date();
      from.setDate(from.getDate() - 400);
      const fromKey = from.toISOString().slice(0, 10);

      const { data: rows, error } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", uid)
        .gte("date", fromKey)
        .order("date", { ascending: true });

      if (error || !rows) {
        if (!mounted) return;
        setMap({});
        setReady(true);
        return;
      }

      const BUCKET = "progress-photos";
      const entries = await Promise.all(
        rows.map(async (row: DailyEntryRow) => {
          let progressPhoto = null as string | null;
          if (row.progress_photo_path) {
            const { data: signed, error: signedErr } = await supabase.storage
              .from(BUCKET)
              .createSignedUrl(row.progress_photo_path, 60 * 60);
            progressPhoto = signed?.signedUrl ?? null;
            if (signedErr) progressPhoto = null;
          }

          return mapRowToDailyEntry(row, progressPhoto);
        }),
      );

      if (!mounted) return;
      const nextMap: EntriesMap = {};
      for (const e of entries) nextMap[e.date] = e;
      setMap(nextMap);
      setReady(true);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(() => {
    setReady(false);
    // Re-run effect by reloading from scratch.
    // Keeping it simple for MVP.
    if (!userId) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      setReady(true);
      return;
    }
    (async () => {
      const from = new Date();
      from.setDate(from.getDate() - 400);
      const fromKey = from.toISOString().slice(0, 10);
      const { data: rows } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("date", fromKey)
        .order("date", { ascending: true });

      if (!rows) {
        setMap({});
        setReady(true);
        return;
      }

      const BUCKET = "progress-photos";
      const entries = await Promise.all(
        rows.map(async (row: DailyEntryRow) => {
          let progressPhoto = null as string | null;
          if (row.progress_photo_path) {
            const { data: signed } = await supabase.storage
              .from(BUCKET)
              .createSignedUrl(row.progress_photo_path, 60 * 60);
            progressPhoto = signed?.signedUrl ?? null;
          }
          return mapRowToDailyEntry(row, progressPhoto);
        }),
      );

      const nextMap: EntriesMap = {};
      for (const e of entries) nextMap[e.date] = e;
      setMap(nextMap);
      setReady(true);
    })();
  }, [userId]);

  const save = useCallback(async (date: string, entry: DailyEntry) => {
    if (!userId) return emptyEntry(date);
    const supabase = getSupabaseClient();
    if (!supabase) return emptyEntry(date);

    const next = entry;

    // Persist to DB (RLS ensures users can only write their own rows).
      const payload = dailyEntryToDbPayload(next, userId, date);

      const { error } = await supabase
        .from("daily_entries")
        .upsert(payload, { onConflict: "user_id,date" });
      
      if (error) throw error;
      
      setMap((m) => ({ ...m, [date]: next }));
      
      return next;
  }, [userId]);

  const value = useMemo(
    () => ({
      map,
      ready,
      todayKey: todayKey(),
      refresh,
      save,
      getEntry: (d: string) => map[d] ?? emptyEntry(d),
    }),
    [map, ready, refresh, save],
  );

  return value;
}
