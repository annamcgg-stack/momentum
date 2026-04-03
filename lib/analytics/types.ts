/**
 * Types for computed analytics — not persisted in DB in MVP.
 * Use these when building premium insights, dashboards, or cached rollup tables later.
 */

import type { DateKey } from "@/lib/types";
import type { DailyEntry } from "@/lib/types";

/** Per-day metrics derived from raw DailyEntry (candidate for future materialized storage). */
export interface ComputedDayMetrics {
  date: DateKey;
  /** 0–100 check-in completeness (see computeCompletionScore). */
  completionScore: number;
  /**
   * 0–100 heuristic recovery score; refine formula as you add science-backed models.
   * null if insufficient data for that day.
   */
  recoveryScore: number | null;
}

export interface Rolling7DayAverages {
  endDate: DateKey;
  avgSleepHours: number | null;
  avgSleepQuality: number | null;
  avgMood: number | null;
  avgEnergy: number | null;
  avgSteps: number | null;
  avgWaterIntake: number | null;
  avgStress: number | null;
  avgSoreness: number | null;
  sampleDays: number;
}

export interface WorkoutConsistencyResult {
  windowDays: number;
  workoutsCompleted: number;
  restDaysMarked: number;
  /** Share of days that had either a workout or an explicit rest day (0–1). */
  activityIntentRatio: number;
}

/** Pairs for correlation / scatter plots (sleep vs mood, etc.). */
export interface SleepMoodObservation {
  date: DateKey;
  sleepHours: number;
  mood: number;
}

export interface SleepEnergyObservation {
  date: DateKey;
  sleepHours: number;
  energy: number;
}

export type EntriesByDate = Record<DateKey, DailyEntry | undefined>;
