import type { UserProfilePreferences } from "@/lib/profile/types";

export type UserProfilePrefsRow = {
  user_id: string;
  display_name: string | null;
  cycle_tracking_enabled: boolean;
  sex: string | null;
  goal_focus: string | null;
  weight_tracking_enabled: boolean;
  water_unit: string;
  updated_at: string | null;
};

export function mapUserProfilePrefsRow(
  row: UserProfilePrefsRow,
): UserProfilePreferences {
  return {
    userId: row.user_id,
    displayName: row.display_name ?? null,
    cycleTrackingEnabled: row.cycle_tracking_enabled ?? false,
    sex: row.sex ?? null,
    goalFocus: row.goal_focus ?? null,
    weightTrackingEnabled: row.weight_tracking_enabled ?? false,
    waterUnit: (row.water_unit as UserProfilePreferences["waterUnit"]) ?? "ml",
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export function userProfilePrefsToDbUpsert(
  userId: string,
  prefs: Omit<UserProfilePreferences, "userId" | "updatedAt">,
) {
  return {
    user_id: userId,
    display_name: prefs.displayName,
    cycle_tracking_enabled: prefs.cycleTrackingEnabled,
    sex: prefs.sex,
    goal_focus: prefs.goalFocus,
    weight_tracking_enabled: prefs.weightTrackingEnabled,
    water_unit: prefs.waterUnit,
    updated_at: new Date().toISOString(),
  };
}

