"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import type { UserProfilePreferences } from "@/lib/profile/types";
import { DEFAULT_USER_PROFILE_PREFERENCES } from "@/lib/profile/types";
import {
  mapUserProfilePrefsRow,
  userProfilePrefsToDbUpsert,
  type UserProfilePrefsRow,
} from "@/lib/supabase/user-profile-preferences-mapper";

export function useUserProfilePreferences(userId: string | null) {
  const [prefs, setPrefs] = useState<UserProfilePreferences | null>(null);
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
      .from("user_profile_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      setPrefs({
        userId,
        ...DEFAULT_USER_PROFILE_PREFERENCES,
        updatedAt: new Date().toISOString(),
      });
      setReady(true);
      return;
    }

    setPrefs(mapUserProfilePrefsRow(data as UserProfilePrefsRow));
    setReady(true);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (
      patch: Partial<Omit<UserProfilePreferences, "userId" | "updatedAt">>,
    ) => {
      if (!userId) return { ok: false as const, error: "Not signed in" };

      const supabase = getSupabaseClient();
      if (!supabase) return { ok: false as const, error: "Supabase not configured" };

      const base: Omit<UserProfilePreferences, "userId" | "updatedAt"> = prefs
        ? {
            displayName: prefs.displayName,
            cycleTrackingEnabled: prefs.cycleTrackingEnabled,
            sex: prefs.sex,
            goalFocus: prefs.goalFocus,
            weightTrackingEnabled: prefs.weightTrackingEnabled,
            waterUnit: prefs.waterUnit,
          }
        : { ...DEFAULT_USER_PROFILE_PREFERENCES };

      const next = { ...base, ...patch };
      const payload = userProfilePrefsToDbUpsert(userId, next);

      const { error } = await supabase
        .from("user_profile_preferences")
        .upsert(payload, { onConflict: "user_id" });

      if (error) return { ok: false as const, error: error.message };

      setPrefs({
        userId,
        ...next,
        updatedAt: payload.updated_at ?? new Date().toISOString(),
      });

      return { ok: true as const };
    },
    [userId, prefs],
  );

  return { prefs, ready, reload: load, save };
}

