/**
 * Helpers: empty defaults, completion score, merging entries.
 */

import type { DailyEntry, DateKey, WorkoutIntensity } from "./types";
import { TRACKED_FIELD_KEYS, type TrackedFieldKey } from "./theme";

export function todayKey(): DateKey {
  return formatDateKey(new Date());
}

export function formatDateKey(d: Date): DateKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function emptyEntry(date: DateKey): DailyEntry {
  return {
    date,
    workoutCompleted: false,
    workoutType: "",
    workoutIntensity: null,
    sleepHours: null,
    sleepQuality: null,
    steps: null,
    mood: null,
    energy: null,
    waterIntake: null,
    notes: "",
    progressPhoto: null,
    progressPhotoPath: null,
    progressPhotoUrl: null,
    stressLevel: null,
    sorenessLevel: null,
    restDay: false,
    cyclePhase: null,
    updatedAt: new Date().toISOString(),
  };
}

export function mergeEntry(base: DailyEntry, patch: Partial<DailyEntry>): DailyEntry {
  return {
    ...base,
    ...patch,
    date: base.date,
    updatedAt: new Date().toISOString(),
  };
}

/** A field counts as “filled” if it has a meaningful value for scoring */
export function fieldFilled(
  entry: DailyEntry,
  key: TrackedFieldKey,
): boolean {
  switch (key) {
    case "workoutCompleted":
      return entry.workoutCompleted === true;
    case "workoutIntensity":
      return entry.workoutIntensity !== null;
    case "sleepHours":
      return entry.sleepHours !== null && entry.sleepHours > 0;
    case "sleepQuality":
      return entry.sleepQuality !== null && entry.sleepQuality >= 1;
    case "steps":
      return entry.steps !== null && entry.steps >= 0 && entry.steps > 0;
    case "mood":
      return entry.mood !== null && entry.mood >= 1;
    case "energy":
      return entry.energy !== null && entry.energy >= 1;
    case "waterIntake":
      return entry.waterIntake !== null && entry.waterIntake > 0;
    case "notes":
      return entry.notes.trim().length > 0;
    case "progressPhoto":
      // Completion is based on whether the user has a saved photo in storage.
      return Boolean(entry.progressPhotoPath ?? entry.progressPhoto);
    default:
      return false;
  }
}

export function completionCount(entry: DailyEntry): number {
  return TRACKED_FIELD_KEYS.filter((k) => fieldFilled(entry, k)).length;
}

export function completionFraction(entry: DailyEntry): number {
  const n = TRACKED_FIELD_KEYS.length;
  return completionCount(entry) / n;
}

export function workoutIntensityLabel(i: WorkoutIntensity | null): string {
  if (!i) return "";
  const map: Record<WorkoutIntensity, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return map[i];
}

/** Last N calendar days ending at `end`, newest first */
export function lastNDays(end: DateKey, n: number): DateKey[] {
  const endD = parseDateKey(end);
  const keys: DateKey[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(endD);
    d.setDate(d.getDate() - i);
    keys.push(formatDateKey(d));
  }
  return keys;
}
