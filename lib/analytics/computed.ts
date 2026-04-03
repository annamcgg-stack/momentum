/**
 * Computed analytics from raw daily entries.
 * Do not persist these in MVP — compute on read or in a background job later.
 */

import type { DailyEntry, DateKey } from "@/lib/types";
import { completionFraction } from "@/lib/entry-utils";
import { lastNDays } from "@/lib/entry-utils";
import type {
  ComputedDayMetrics,
  EntriesByDate,
  Rolling7DayAverages,
  SleepEnergyObservation,
  SleepMoodObservation,
  WorkoutConsistencyResult,
} from "./types";

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Completion as 0–100 (aligns with ring / fraction). */
export function computeCompletionScore(entry: DailyEntry): number {
  return Math.round(completionFraction(entry) * 100);
}

/**
 * Simple recovery heuristic: sleep quality, stress inverse, soreness inverse, rest bonus.
 * Replace with ML or validated scoring when ready.
 */
export function computeRecoveryScore(entry: DailyEntry): number | null {
  const hasSignal =
    entry.sleepQuality != null ||
    entry.stressLevel != null ||
    entry.sorenessLevel != null ||
    entry.restDay;
  if (!hasSignal) return null;

  let score = 50;
  if (entry.sleepQuality != null) {
    score += (entry.sleepQuality - 3) * 8;
  }
  if (entry.stressLevel != null) {
    score -= (entry.stressLevel - 3) * 6;
  }
  if (entry.sorenessLevel != null) {
    score -= (entry.sorenessLevel - 3) * 5;
  }
  if (entry.restDay) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeComputedDayMetrics(entry: DailyEntry): ComputedDayMetrics {
  return {
    date: entry.date,
    completionScore: computeCompletionScore(entry),
    recoveryScore: computeRecoveryScore(entry),
  };
}

export function computeRolling7DayAverages(
  map: EntriesByDate,
  endDate: DateKey,
): Rolling7DayAverages {
  const keys = lastNDays(endDate, 7);
  const entries = keys.map((k) => map[k]).filter((e): e is DailyEntry => Boolean(e));

  const sleepH = entries.map((e) => e.sleepHours).filter((v): v is number => v != null && v > 0);
  const sleepQ = entries.map((e) => e.sleepQuality).filter((v): v is number => v != null && v >= 1);
  const moods = entries.map((e) => e.mood).filter((v): v is number => v != null && v >= 1);
  const energies = entries.map((e) => e.energy).filter((v): v is number => v != null && v >= 1);
  const steps = entries.map((e) => e.steps).filter((v): v is number => v != null && v > 0);
  const water = entries.map((e) => e.waterIntake).filter((v): v is number => v != null && v > 0);
  const stress = entries.map((e) => e.stressLevel).filter((v): v is number => v != null && v >= 1);
  const sore = entries.map((e) => e.sorenessLevel).filter((v): v is number => v != null && v >= 1);

  return {
    endDate,
    avgSleepHours: avg(sleepH),
    avgSleepQuality: avg(sleepQ),
    avgMood: avg(moods),
    avgEnergy: avg(energies),
    avgSteps: avg(steps),
    avgWaterIntake: avg(water),
    avgStress: avg(stress),
    avgSoreness: avg(sore),
    sampleDays: entries.length,
  };
}

export function computeWorkoutConsistency(
  map: EntriesByDate,
  endDate: DateKey,
  windowDays = 7,
): WorkoutConsistencyResult {
  const keys = lastNDays(endDate, windowDays);
  let workoutsCompleted = 0;
  let restDaysMarked = 0;
  let intentDays = 0;

  for (const k of keys) {
    const e = map[k];
    if (!e) continue;
    if (e.workoutCompleted) workoutsCompleted++;
    if (e.restDay) restDaysMarked++;
    if (e.workoutCompleted || e.restDay) intentDays++;
  }

  return {
    windowDays: keys.length,
    workoutsCompleted,
    restDaysMarked,
    activityIntentRatio: keys.length ? intentDays / keys.length : 0,
  };
}

export function collectSleepMoodPairs(
  map: EntriesByDate,
  keys: DateKey[],
): SleepMoodObservation[] {
  const out: SleepMoodObservation[] = [];
  for (const k of keys) {
    const e = map[k];
    if (!e) continue;
    if (e.sleepHours != null && e.sleepHours > 0 && e.mood != null && e.mood >= 1) {
      out.push({ date: k, sleepHours: e.sleepHours, mood: e.mood });
    }
  }
  return out;
}

export function collectSleepEnergyPairs(
  map: EntriesByDate,
  keys: DateKey[],
): SleepEnergyObservation[] {
  const out: SleepEnergyObservation[] = [];
  for (const k of keys) {
    const e = map[k];
    if (!e) continue;
    if (e.sleepHours != null && e.sleepHours > 0 && e.energy != null && e.energy >= 1) {
      out.push({ date: k, sleepHours: e.sleepHours, energy: e.energy });
    }
  }
  return out;
}

/** Lightweight linear correlation (-1..1) for pattern detection; expand with proper stats later. */
export function correlationPearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denx = 0;
  let deny = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    denx += dx * dx;
    deny += dy * dy;
  }
  const den = Math.sqrt(denx * deny);
  if (den === 0) return null;
  return num / den;
}

export function sleepVsMoodCorrelation(map: EntriesByDate, endDate: DateKey, days = 14): number | null {
  const keys = lastNDays(endDate, days);
  const pairs = collectSleepMoodPairs(map, keys);
  if (pairs.length < 3) return null;
  return correlationPearson(
    pairs.map((p) => p.sleepHours),
    pairs.map((p) => p.mood),
  );
}

export function sleepVsEnergyCorrelation(map: EntriesByDate, endDate: DateKey, days = 14): number | null {
  const keys = lastNDays(endDate, days);
  const pairs = collectSleepEnergyPairs(map, keys);
  if (pairs.length < 3) return null;
  return correlationPearson(
    pairs.map((p) => p.sleepHours),
    pairs.map((p) => p.energy),
  );
}
