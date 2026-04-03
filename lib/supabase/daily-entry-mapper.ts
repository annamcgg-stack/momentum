/**
 * Maps between Supabase `daily_entries` rows and app `DailyEntry`.
 * Keeps column naming in one place as you add analytics fields.
 */

import type { DailyEntry, WorkoutIntensity } from "@/lib/types";

/** Row shape from PostgREST (snake_case). */
export type DailyEntryRow = {
  date: string;
  workout_completed?: boolean | null;
  workout_type?: string | null;
  workout_intensity?: WorkoutIntensity | null;
  sleep_hours?: number | null;
  sleep_quality?: number | null;
  steps?: number | null;
  mood?: number | null;
  energy?: number | null;
  water_oz?: number | null;
  water_intake?: number | null;
  notes?: string | null;
  progress_photo_path?: string | null;
  progress_photo_url?: string | null;
  stress_level?: number | null;
  soreness_level?: number | null;
  rest_day?: boolean | null;
  cycle_phase?: string | null;
  updated_at?: string | null;
};

export function mapRowToDailyEntry(
  row: DailyEntryRow,
  signedDisplayUrl: string | null,
): DailyEntry {
  const waterFromDb = row.water_intake ?? row.water_oz ?? null;
  return {
    date: row.date,
    workoutCompleted: row.workout_completed ?? false,
    workoutType: row.workout_type ?? "",
    workoutIntensity: row.workout_intensity ?? null,
    sleepHours: row.sleep_hours ?? null,
    sleepQuality: row.sleep_quality ?? null,
    steps: row.steps ?? null,
    mood: row.mood ?? null,
    energy: row.energy ?? null,
    waterIntake: waterFromDb,
    notes: row.notes ?? "",
    progressPhotoPath: row.progress_photo_path ?? null,
    progressPhotoUrl: row.progress_photo_url ?? null,
    progressPhoto: signedDisplayUrl,
    stressLevel: row.stress_level ?? null,
    sorenessLevel: row.soreness_level ?? null,
    restDay: row.rest_day ?? false,
    cyclePhase: row.cycle_phase?.trim() ? row.cycle_phase : null,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

/** Payload for upsert (matches table columns; omit id, created_at). */
export function dailyEntryToDbPayload(entry: DailyEntry, userId: string, date: string) {
  return {
    user_id: userId,
    date,
    workout_completed: entry.workoutCompleted,
    workout_type: entry.workoutType || "",
    workout_intensity: entry.workoutIntensity,
    sleep_hours: entry.sleepHours,
    sleep_quality: entry.sleepQuality,
    steps: entry.steps,
    mood: entry.mood,
    energy: entry.energy,
    water_intake: entry.waterIntake,
    notes: entry.notes || "",
    progress_photo_path: entry.progressPhotoPath,
    progress_photo_url: entry.progressPhotoUrl,
    stress_level: entry.stressLevel,
    soreness_level: entry.sorenessLevel,
    rest_day: entry.restDay,
    cycle_phase: entry.cyclePhase,
    updated_at: entry.updatedAt,
  };
}
