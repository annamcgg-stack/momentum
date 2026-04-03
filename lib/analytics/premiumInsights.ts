/**
 * Premium insight layer — compose metrics from `computed.ts` into user-facing blocks.
 *
 * - Keep **free** rule copy in `lib/insights.ts` (generateInsights).
 * - Add **paid / advanced** narratives, thresholds, and ML hooks here as the product grows.
 * - Gate what you actually show in the UI (feature flags, subscription, etc.); this module only
 *   computes candidates from the same raw `daily_entries` data.
 */

import type { DateKey } from "@/lib/types";
import type { EntriesByDate } from "./types";
import {
  computeRolling7DayAverages,
  computeWorkoutConsistency,
  sleepVsEnergyCorrelation,
  sleepVsMoodCorrelation,
} from "./computed";

export type PremiumInsightCategory =
  | "pattern"
  | "recovery"
  | "consistency"
  | "correlation";

/** One premium-ready insight card (copy can be swapped per locale / A/B). */
export interface PremiumInsight {
  id: string;
  category: PremiumInsightCategory;
  title: string;
  detail: string;
}

/** Bundle for dashboards, “Insights+” tab, or cached API responses later. */
export interface PremiumInsightsSnapshot {
  endDate: DateKey;
  /** Narrative blocks — empty when not enough data. */
  insights: PremiumInsight[];
  /** Raw correlation hooks for charts or deeper UI (optional). */
  correlations: {
    sleepVsMood: number | null;
    sleepVsEnergy: number | null;
  };
}

const LOOKBACK_DAYS = 14;

/**
 * Returns structured premium insight candidates for `endDate` (usually today).
 * Safe to call on every page load; no side effects.
 */
export function computePremiumInsightsSnapshot(
  map: EntriesByDate,
  endDate: DateKey,
): PremiumInsightsSnapshot {
  const rolling = computeRolling7DayAverages(map, endDate);
  const consistency = computeWorkoutConsistency(map, endDate, 7);
  const moodR = sleepVsMoodCorrelation(map, endDate, LOOKBACK_DAYS);
  const energyR = sleepVsEnergyCorrelation(map, endDate, LOOKBACK_DAYS);

  const insights: PremiumInsight[] = [];

  if (rolling.sampleDays >= 5 && rolling.avgSleepHours != null && rolling.avgSleepHours < 6.5) {
    insights.push({
      id: "rolling-sleep-short",
      category: "pattern",
      title: "Sleep window",
      detail: `Your 7-day average sleep is about ${rolling.avgSleepHours.toFixed(1)} hours — consider a small bedtime shift.`,
    });
  }

  if (rolling.sampleDays >= 5 && rolling.avgSleepHours != null && rolling.avgSleepHours >= 7.5) {
    insights.push({
      id: "rolling-sleep-strong",
      category: "pattern",
      title: "Sleep consistency",
      detail: `Your recent nights average about ${rolling.avgSleepHours.toFixed(1)} hours — a solid foundation for recovery.`,
    });
  }

  if (consistency.windowDays >= 7 && consistency.activityIntentRatio >= 0.65) {
    insights.push({
      id: "intent-consistency",
      category: "consistency",
      title: "Training intent",
      detail:
        "You’re marking workouts or rest days on most days — that clarity helps track real load vs recovery.",
    });
  }

  if (moodR != null && moodR > 0.35) {
    insights.push({
      id: "corr-sleep-mood",
      category: "correlation",
      title: "Sleep & mood",
      detail: "There’s a positive link between how long you sleep and how you rate mood lately.",
    });
  }

  if (energyR != null && energyR > 0.35) {
    insights.push({
      id: "corr-sleep-energy",
      category: "correlation",
      title: "Sleep & energy",
      detail: "Your energy ratings tend to move with sleep length — worth protecting sleep on busy weeks.",
    });
  }

  return {
    endDate,
    insights: insights.slice(0, 5),
    correlations: {
      sleepVsMood: moodR,
      sleepVsEnergy: energyR,
    },
  };
}
