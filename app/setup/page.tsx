"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import { BRAND } from "@/lib/theme";

const focusOptions = [
  "Fitness",
  "Sleep",
  "Recovery",
  "Routine",
  "Energy",
] as const;

const metricOptions = ["Steps", "Minutes active", "Both"] as const;

export default function SetupPage() {
  const router = useRouter();

  const [focus, setFocus] = useState<(typeof focusOptions)[number]>("Fitness");
  const [metric, setMetric] = useState<(typeof metricOptions)[number]>("Steps");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase is not configured yet.");

      const { error } = await supabase.auth.updateUser({
        data: {
          onboarding_complete: true,
          onboarding_focus: focus,
          onboarding_activity_metric: metric,
        },
      });
      if (error) throw error;

      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
      <div className="rounded-3xl border border-accent-muted/60 bg-white/70 p-5 shadow-card md:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
          {BRAND.name}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          Quick setup
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          One small step so we can personalize your start.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              What matters most right now?
            </p>
            <div className="flex flex-wrap gap-2">
              {focusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFocus(option)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    focus === option
                      ? "bg-ink text-white"
                      : "bg-canvas-subtle text-ink-muted hover:bg-accent-muted/60"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              Preferred activity metric
            </p>
            <div className="flex flex-wrap gap-2">
              {metricOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMetric(option)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    metric === option
                      ? "bg-ink text-white"
                      : "bg-canvas-subtle text-ink-muted hover:bg-accent-muted/60"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-rose">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Finishing setup..." : "Continue to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

