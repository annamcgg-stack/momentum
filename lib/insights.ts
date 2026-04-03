/**
 * Free-tier rule-based insights from recent entries. No AI — just comparisons and counts.
 *
 * - Deeper metrics: `@/lib/analytics` (`computed.ts`).
 * - Premium/composed narratives: `@/lib/analytics` or `@/lib/insights/premium` (`computePremiumInsightsSnapshot`).
 */

import type { DailyEntry } from "./types";
import { completionFraction, lastNDays, todayKey } from "./entry-utils";
import type { EntriesMap } from "./storage";

export interface Insight {
  id: string;
  text: string;
  tone: "positive" | "neutral" | "gentle";
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function generateInsights(map: EntriesMap, days = CONSIDER_LAST_DAYS): Insight[] {
  const end = todayKey();
  const keys = lastNDays(end, days);
  const entries = keys.map((k) => map[k]).filter(Boolean) as DailyEntry[];

  const insights: Insight[] = [];

  if (entries.length === 0) {
    insights.push({
      id: "empty",
      text: "Log a few days to unlock personal patterns.",
      tone: "gentle",
    });
    return insights;
  }

  const withSleep = entries.filter((e) => e.sleepHours !== null && e.sleepHours > 0);
  const withMood = entries.filter((e) => e.mood !== null);

  if (withSleep.length >= 3 && withMood.length >= 3) {
    const highSleepMoods = withMood.filter((e) => (e.sleepHours ?? 0) >= 7).map((e) => e.mood!);
    const lowSleepMoods = withMood.filter((e) => (e.sleepHours ?? 0) < 7 && (e.sleepHours ?? 0) > 0).map((e) => e.mood!);
    const aHigh = avg(highSleepMoods);
    const aLow = avg(lowSleepMoods);
    if (aHigh !== null && aLow !== null && highSleepMoods.length >= 2 && lowSleepMoods.length >= 2) {
      if (aHigh > aLow + 0.5) {
        insights.push({
          id: "sleep-mood-up",
          text: "Your mood tends to run higher on 7+ hour sleep nights.",
          tone: "positive",
        });
      }
      if (aLow < aHigh - 0.3 && lowSleepMoods.length >= 2) {
        insights.push({
          id: "sleep-mood-down",
          text: "Your mood is often lower on shorter-sleep days — extra recovery might help.",
          tone: "gentle",
        });
      }
    }
  }

  const withEnergy = entries.filter((e) => e.energy != null && e.energy >= 1);
  if (withSleep.length >= 3 && withEnergy.length >= 3) {
    const highSleepEnergy = withEnergy.filter((e) => (e.sleepHours ?? 0) >= 7).map((e) => e.energy!);
    const lowSleepEnergy = withEnergy
      .filter((e) => (e.sleepHours ?? 0) < 7 && (e.sleepHours ?? 0) > 0)
      .map((e) => e.energy!);
    const eHigh = avg(highSleepEnergy);
    const eLow = avg(lowSleepEnergy);
    if (eHigh !== null && eLow !== null && highSleepEnergy.length >= 2 && lowSleepEnergy.length >= 2) {
      if (eHigh > eLow + 0.5) {
        insights.push({
          id: "sleep-energy-up",
          text: "Your energy ratings look stronger when sleep hits 7+ hours.",
          tone: "positive",
        });
      }
    }
  }

  const weekKeys = lastNDays(end, 7);
  const weekEntries = weekKeys.map((k) => map[k]).filter(Boolean) as DailyEntry[];
  const workouts = weekEntries.filter((e) => e.workoutCompleted).length;
  if (workouts > 0) {
    insights.push({
      id: "workouts-week",
      text: `You completed ${workouts} workout${workouts === 1 ? "" : "s"} this week.`,
      tone: "positive",
    });
  }

  const completedFields = weekEntries.map((e) => completionFraction(e));
  const habitAvg = avg(completedFields.filter((x) => x > 0));
  if (habitAvg !== null && habitAvg >= 0.6 && weekEntries.length >= 4) {
    insights.push({
      id: "consistent",
      text: "You’re filling in most of your check-ins — consistency is showing.",
      tone: "positive",
    });
  }

  const stepsNums = weekEntries.filter((e) => e.steps != null && e.steps > 0).map((e) => e.steps!);
  const sleepNums = weekEntries.filter((e) => e.sleepHours != null).map((e) => e.sleepHours!);
  if (stepsNums.length >= 3) {
    const s = avg(stepsNums);
    if (s !== null && s >= 8000) {
      insights.push({
        id: "steps-strong",
        text: "Your activity has been steady this week — keep moving on rest days too.",
        tone: "positive",
      });
    }
  }
  if (sleepNums.length >= 4) {
    const sl = avg(sleepNums);
    if (sl !== null && sl < 6.5) {
      insights.push({
        id: "sleep-low",
        text: "Average sleep dipped under 6.5h this week; small bedtime shifts add up.",
        tone: "gentle",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: "keep-going",
      text: "Keep logging — patterns emerge after a handful of honest check-ins.",
      tone: "neutral",
    });
  }

  return insights.slice(0, 5);
}

const CONSIDER_LAST_DAYS = 14;
