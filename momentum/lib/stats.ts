/**
 * Aggregates for Progress dashboard: streaks, weekly averages, chart series.
 */

import type { DailyEntry } from "./types";
import type { EntriesMap } from "./storage";
import {
  completionFraction,
  formatDateKey,
  lastNDays,
  parseDateKey,
  todayKey,
} from "./entry-utils";

export interface WeekStat {
  dateKey: string;
  label: string;
  sleepHours: number | null;
  mood: number | null;
  steps: number | null;
  completion: number;
  logged: boolean;
}

export function weekSeries(map: EntriesMap, end = todayKey()): WeekStat[] {
  const keys = lastNDays(end, 7).reverse();
  return keys.map((k) => {
    const e = map[k];
    const d = parseDateKey(k);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    if (!e) {
      return {
        dateKey: k,
        label,
        sleepHours: null,
        mood: null,
        steps: null,
        completion: 0,
        logged: false,
      };
    }
    return {
      dateKey: k,
      label,
      sleepHours: e.sleepHours,
      mood: e.mood,
      steps: e.steps,
      completion: completionFraction(e),
      logged: true,
    };
  });
}

function dayCountsForStreak(e: DailyEntry | undefined): boolean {
  if (!e) return false;
  if (e.restDay) return true;
  if (e.workoutCompleted) return true;
  return completionFraction(e) >= 0.35;
}

/**
 * Consecutive days with a solid check-in, counting back from today.
 * If today is still sparse, we don’t break the streak — we start counting from yesterday.
 */
export function currentStreak(map: EntriesMap, end = todayKey()): number {
  let streak = 0;
  const cursor = parseDateKey(end);
  let isFirst = true;

  for (let i = 0; i < 400; i++) {
    const key = formatDateKey(cursor);
    const e = map[key];
    const ok = dayCountsForStreak(e);

    if (ok) {
      streak++;
    } else if (isFirst && key === end) {
      // Today in progress or empty — look at prior days only
    } else {
      break;
    }
    isFirst = false;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function workoutsThisWeek(map: EntriesMap, end = todayKey()): number {
  const keys = lastNDays(end, 7);
  return keys.filter((k) => map[k]?.workoutCompleted).length;
}

export function avgSleepThisWeek(map: EntriesMap, end = todayKey()): number | null {
  const keys = lastNDays(end, 7);
  const vals = keys.map((k) => map[k]?.sleepHours).filter((v): v is number => v != null && v > 0);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function avgMoodThisWeek(map: EntriesMap, end = todayKey()): number | null {
  const keys = lastNDays(end, 7);
  const vals = keys.map((k) => map[k]?.mood).filter((v): v is number => v != null && v >= 1);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function habitCompletionThisWeek(map: EntriesMap, end = todayKey()): number | null {
  const keys = lastNDays(end, 7);
  const fracs = keys
    .map((k) => map[k])
    .filter((e): e is DailyEntry => Boolean(e))
    .map((e) => completionFraction(e));
  if (fracs.length === 0) return null;
  return (fracs.reduce((a, b) => a + b, 0) / fracs.length) * 100;
}
