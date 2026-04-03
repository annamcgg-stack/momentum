"use client";

/**
 * Progress: performance-first snapshot (sleep + recovery + stress + activity).
 */

import { Card } from "@/components/ui/Card";
import { MiniBars } from "@/components/ui/MiniBars";
import { InsightsPanel } from "@/components/InsightsPanel";
import { useEntries } from "@/hooks/useEntries";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useUserProfilePreferences } from "@/hooks/useUserProfilePreferences";
import {
  avgStressThisWeek,
  avgSleepThisWeek,
  weekSeries,
} from "@/lib/stats";
import { todayKey } from "@/lib/entry-utils";
import { computeRecoveryScore } from "@/lib/analytics";

const ML_PER_OZ = 29.5735;

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default function ProgressPage() {
  const { map, ready } = useEntries();
  const { user } = useSupabaseUser();
  const { prefs: profilePrefs, ready: profileReady } = useUserProfilePreferences(
    user?.id ?? null,
  );
  const end = todayKey();

  if (!ready) {
    return (
      <div className="animate-pulse space-y-4 py-8">
        <div className="h-24 rounded-3xl bg-canvas-subtle" />
        <div className="h-48 rounded-3xl bg-canvas-subtle" />
      </div>
    );
  }

  const series = weekSeries(map, end);
  const weekKeys = series.map((s) => s.dateKey);

  const sleepAvg = avgSleepThisWeek(map, end);
  const stressAvg = avgStressThisWeek(map, end);

  const waterUnit = profilePrefs?.waterUnit ?? "oz";
  const toWaterUnit = (ml: number) => (waterUnit === "ml" ? ml : ml / ML_PER_OZ);

  const workoutIntentDays = weekKeys.filter((k) => {
    const e = map[k];
    return Boolean(e && (e.workoutCompleted || e.restDay));
  }).length;

  const hydratedDays = weekKeys.filter((k) => {
    const e = map[k];
    return Boolean(e && e.waterIntake != null && e.waterIntake > 0);
  }).length;

  const avgHydrationMl = avg(
    weekKeys
      .map((k) => map[k]?.waterIntake)
      .filter((v): v is number => v != null && v > 0),
  );

  const recoveryScores = weekKeys
    .map((k) => {
      const e = map[k];
      return e ? computeRecoveryScore(e) : null;
    })
    .filter((v): v is number => typeof v === "number");

  const recoveryAvg = avg(recoveryScores);
  let recoveryTrend: "steady" | "improving" | "dipping" | null = null;
  if (recoveryScores.length >= 7 && recoveryScores.length > 0) {
    const recent = avg(recoveryScores.slice(-3));
    const earlier = avg(
      recoveryScores.slice(0, Math.max(1, recoveryScores.length - 3)),
    );
    if (recent != null && earlier != null) {
      const delta = recent - earlier;
      if (Math.abs(delta) < 5) recoveryTrend = "steady";
      else recoveryTrend = delta > 0 ? "improving" : "dipping";
    }
  }

  const energyAvg = avg(
    weekKeys
      .map((k) => map[k]?.energy)
      .filter((v): v is number => v != null && v >= 1),
  );

  const workoutConsistencyPct = Math.round((workoutIntentDays / 7) * 100);
  const hydrationConsistencyPct = Math.round((hydratedDays / 7) * 100);

  const hasAny = Object.keys(map).length > 0;
  const weightEnabled = Boolean(profileReady && profilePrefs?.weightTrackingEnabled);
  const cycleEnabled = Boolean(profileReady && profilePrefs?.cycleTrackingEnabled);

  const weightValues = weekKeys.map((k) => map[k]?.weightKg ?? null);
  const weightAvg = avg(weightValues.filter((v): v is number => v != null));
  const hasAnyWeight = weightEnabled && weightValues.some((v) => v != null);

  const hydrationAvgDisplay =
    avgHydrationMl == null
      ? null
      : `${toWaterUnit(avgHydrationMl).toFixed(waterUnit === "ml" ? 0 : 1)} ${waterUnit}`;

  const focusRecommendation =
    hydratedDays <= 2
      ? "Hydration first: even small, consistent sips can support recovery."
      : sleepAvg != null && sleepAvg < 6.5
        ? "Sleep protection: aim for a slightly earlier bedtime this week."
        : stressAvg != null && stressAvg >= 3.8
          ? "Calm recovery: prioritize rest, gentle movement, and lower-intensity training."
          : workoutConsistencyPct < 60
            ? "Build training rhythm: check in with one solid session (or a rest day) each day you can."
            : recoveryAvg != null && recoveryAvg < 55
              ? "Recovery momentum: focus on sleep quality + stress downshifts for the next few days."
              : "Stay the course: your recovery signals look good — keep consistency gentle and steady.";

  const sleepChartValues = series.map((s) => s.sleepHours ?? 0);
  const recoveryChartValues = weekKeys.map((k) => {
    const e = map[k];
    const r = e ? computeRecoveryScore(e) : null;
    return r ?? 0;
  });
  const workoutChartValues = weekKeys.map((k) => {
    const e = map[k];
    return e && (e.workoutCompleted || e.restDay) ? 100 : 0;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Progress</h1>
        <p className="text-sm text-ink-muted">A coach-style view of your week.</p>
      </div>

      {!hasAny ? (
        <Card>
          <p className="text-sm text-ink-muted">
            No entries yet. Check in from <strong>Today</strong> — your week will come alive after a few days.
          </p>
        </Card>
      ) : null}

      {/* 1) This week at a glance */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">This week at a glance</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Sleep avg</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">
              {sleepAvg != null ? `${sleepAvg.toFixed(1)}h` : "—"}
            </p>
            <p className="text-sm text-ink-muted">sleep hours</p>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Workout consistency</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">{workoutConsistencyPct}%</p>
            <p className="text-sm text-ink-muted">{workoutIntentDays}/7 active days</p>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Recovery trend</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">
              {recoveryAvg != null ? `${Math.round(recoveryAvg)}` : "—"}/100
            </p>
            <p className="text-sm text-ink-muted">
              {recoveryTrend ? `looks ${recoveryTrend}` : "avg of recovery score"}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Stress avg</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">
              {stressAvg != null ? stressAvg.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-ink-muted">rated 1–5 (lower is calmer)</p>
          </Card>

          <Card className="p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Hydration consistency</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">
              {hydrationConsistencyPct}%
            </p>
            <p className="text-sm text-ink-muted">
              {hydratedDays}/7 days entered{hydrationAvgDisplay ? ` · avg ${hydrationAvgDisplay}` : ""}
            </p>
          </Card>
        </div>
      </div>

      {/* 2) Key insights */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Key insights</h2>
        <InsightsPanel
          map={map}
          hideHeading
          title="Key insights"
          subtitle=""
        />
      </div>

      {/* 3) Trends */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Trends</h2>
        <div className="space-y-4">
          <Card>
            <MiniBars
              caption="Sleep trend — last 7 days"
              labels={series.map((s) => s.label)}
              values={sleepChartValues}
              colorClass="bg-accent/80"
            />
          </Card>

          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
              Recovery / energy trend
            </p>
            <p className="mb-4 text-sm text-ink-muted">
              Avg energy: {energyAvg != null ? `${energyAvg.toFixed(1)}/5` : "—"}
            </p>
            <MiniBars
              caption="Recovery score — last 7 days"
              labels={series.map((s) => s.label)}
              values={recoveryChartValues}
              colorClass="bg-sage/90"
            />
          </Card>

          <Card>
            <MiniBars
              caption="Training/rest consistency — last 7 days"
              labels={series.map((s) => s.label)}
              values={workoutChartValues}
              colorClass="bg-rose/80"
            />
          </Card>
        </div>
      </div>

      {/* 4) What to focus on next */}
      <Card>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">What to focus on next</p>
        <p className="font-display text-xl font-semibold text-ink">{focusRecommendation}</p>
        <p className="mt-2 text-sm text-ink-muted">
          Pick one small move. Momentum comes from showing up consistently — not from doing everything.
        </p>
      </Card>

      {/* 5) Optional metrics */}
      {(weightEnabled || cycleEnabled) ? (
        <div className="space-y-4">
          {weightEnabled && hasAnyWeight ? (
            <Card>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Weight (optional)</p>
              <p className="mb-4 text-sm text-ink-muted">
                Avg: {weightAvg != null ? `${weightAvg.toFixed(1)} kg` : "—"}
              </p>
              <MiniBars
                caption="Weight trend — last 7 days"
                labels={series.map((s) => s.label)}
                values={weekKeys.map((k) => map[k]?.weightKg ?? 0)}
                colorClass="bg-ink/20"
              />
            </Card>
          ) : null}

          {cycleEnabled ? (
            <Card>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Cycle tracking</p>
              {(() => {
                const cycleDays = weekKeys.filter((k) => {
                  const v = map[k]?.cyclePhase;
                  return v != null && v.trim().length > 0;
                }).length;

                const recent = weekKeys
                  .slice(-7)
                  .reverse()
                  .map((k) => ({ k, v: map[k]?.cyclePhase }))
                  .filter((x) => x.v != null && x.v.trim().length > 0)
                  .slice(0, 3);

                return (
                  <>
                    <p className="mb-3 text-sm text-ink-muted">
                      Cycle phase check-ins: {cycleDays}/7 days
                    </p>
                    {recent.length > 0 ? (
                      <p className="text-sm text-ink-muted">
                        Recent: {recent.map((r) => r.v).join(", ")}
                      </p>
                    ) : (
                      <p className="text-sm text-ink-muted">
                        Add a cycle phase when you know it — we’ll use it for smarter insights later.
                      </p>
                    )}
                  </>
                );
              })()}
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
