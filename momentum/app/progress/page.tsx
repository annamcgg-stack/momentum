"use client";

/**
 * Progress: streaks, weekly averages, simple 7-day charts, habit completion.
 */

import { Card } from "@/components/ui/Card";
import { MiniBars } from "@/components/ui/MiniBars";
import { InsightsPanel } from "@/components/InsightsPanel";
import { useEntries } from "@/hooks/useEntries";
import {
  avgMoodThisWeek,
  avgSleepThisWeek,
  currentStreak,
  habitCompletionThisWeek,
  weekSeries,
  workoutsThisWeek,
} from "@/lib/stats";
import { todayKey } from "@/lib/entry-utils";

export default function ProgressPage() {
  const { map, ready } = useEntries();
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
  const streak = currentStreak(map, end);
  const workouts = workoutsThisWeek(map, end);
  const sleepAvg = avgSleepThisWeek(map, end);
  const moodAvg = avgMoodThisWeek(map, end);
  const habitPct = habitCompletionThisWeek(map, end);

  const hasAny = Object.keys(map).length > 0;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Progress</h1>
        <p className="text-sm text-ink-muted">Your week at a glance.</p>
      </div>

      {!hasAny ? (
        <Card>
          <p className="text-sm text-ink-muted">
            No entries yet. Check in from <strong>Today</strong> — your charts will
            light up after a few days.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Streak
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">{streak}</p>
          <p className="text-sm text-ink-muted">day streak</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Workouts (7d)
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">{workouts}</p>
          <p className="text-sm text-ink-muted">sessions completed</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Avg sleep
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">
            {sleepAvg != null ? `${sleepAvg.toFixed(1)}h` : "—"}
          </p>
          <p className="text-sm text-ink-muted">this week</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Avg mood / energy
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">
            {moodAvg != null ? moodAvg.toFixed(1) : "—"}
          </p>
          <p className="text-sm text-ink-muted">out of 5</p>
        </Card>
      </div>

      <Card>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-faint">
          Check-in completion
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-4xl font-semibold text-ink">
              {habitPct != null ? `${Math.round(habitPct)}%` : "—"}
            </p>
            <p className="text-sm text-ink-muted">avg fields filled (7 days)</p>
          </div>
          <div className="h-2 flex-1 max-w-[10rem] overflow-hidden rounded-full bg-accent-muted/40">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.min(100, habitPct ?? 0)}%` }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <MiniBars
          caption="Sleep hours — last 7 days"
          labels={series.map((s) => s.label)}
          values={series.map((s) => s.sleepHours ?? 0)}
          colorClass="bg-accent/80"
        />
      </Card>

      <Card>
        <MiniBars
          caption="Mood / energy — last 7 days"
          labels={series.map((s) => s.label)}
          values={series.map((s) => s.mood ?? 0)}
          colorClass="bg-sage/90"
        />
      </Card>

      <Card>
        <MiniBars
          caption="Daily completion — last 7 days"
          labels={series.map((s) => s.label)}
          values={series.map((s) => s.completion * 100)}
          colorClass="bg-rose/80"
        />
      </Card>

      <InsightsPanel map={map} />
    </div>
  );
}
