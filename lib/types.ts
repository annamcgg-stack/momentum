/**
 * Core data types for Momentum.
 * One DailyEntry per calendar date (YYYY-MM-DD). Expand fields here when you add new tracked habits.
 */

export type WorkoutIntensity = "low" | "medium" | "high";

/** ISO date string, calendar day only: YYYY-MM-DD */
export type DateKey = string;

export interface DailyEntry {
  date: DateKey;
  workoutCompleted: boolean;
  /** Optional label e.g. Strength, Run, Yoga */
  workoutType: string;
  workoutIntensity: WorkoutIntensity | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  steps: number | null;
  mood: number | null;
  /** 1–5, separate from mood (premium insights: sleep vs energy, etc.). */
  energy: number | null;
  /**
   * Standardized hydration value in milliliters.
   * The UI converts this to/from the user’s preferred unit (ml or oz).
   * DB: `water_intake_ml` (preferred), plus backward-compat fallback.
   */
  waterIntake: number | null;
  /** Optional body weight (kg). Stored only when users enable weight tracking. */
  weightKg: number | null;
  notes: string;
  /**
   * Progress photo URL for display (signed URL from Supabase storage).
   * Not stored in DB; use `progressPhotoPath` as canonical when using storage.
   */
  progressPhoto: string | null;
  /**
   * Storage object key for the photo (used for DB + replacement/removal).
   * Stored in Supabase table and used to generate signed URLs.
   */
  progressPhotoPath: string | null;
  /**
   * Optional URL stored in DB when photo is hosted externally or denormalized.
   * Prefer `progressPhotoPath` + signed URL for Supabase private bucket.
   */
  progressPhotoUrl: string | null;
  stressLevel: number | null;
  sorenessLevel: number | null;
  restDay: boolean;
  /** Optional free-text phase for future cycle-aware insights. */
  cyclePhase: string | null;
  updatedAt: string;
}

/** Partial fields used when merging form state */
export type DailyEntryPatch = Partial<Omit<DailyEntry, "date">> & {
  date?: DateKey;
};
