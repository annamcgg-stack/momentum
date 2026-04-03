/**
 * Premium insight composition (Insights+ / paid tier).
 *
 * Re-exports the implementation in `lib/analytics/premiumInsights.ts` so you can import from
 * either `@/lib/analytics` or this path as the app grows.
 *
 * Free-tier strings: `lib/insights.ts` → `generateInsights`.
 */

export {
  type PremiumInsight,
  type PremiumInsightCategory,
  type PremiumInsightsSnapshot,
  computePremiumInsightsSnapshot,
} from "../analytics/premiumInsights";
