/**
 * Analytics — import from here.
 *
 * - `computed` — numeric metrics & correlations (building blocks).
 * - `premiumInsights` — composed “Insights+” candidates (gate in UI later).
 *
 * Example:
 *   import { computeRolling7DayAverages, computePremiumInsightsSnapshot } from "@/lib/analytics";
 */

export * from "./types";
export * from "./computed";
export * from "./premiumInsights";
