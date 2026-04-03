"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import { BRAND } from "@/lib/theme";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { userProfilePrefsToDbUpsert } from "@/lib/supabase/user-profile-preferences-mapper";

export default function SetupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState(false);
  const [sex, setSex] = useState("");
  const [goalFocus, setGoalFocus] = useState("");
  const [weightTrackingEnabled, setWeightTrackingEnabled] = useState(false);
  const [waterUnit, setWaterUnit] = useState<"ml" | "oz">("oz");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase is not configured yet.");

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not signed in.");

      // 1) Save profile preferences to DB (future personalization + cycle-gating).
      const profilePayload = userProfilePrefsToDbUpsert(user.id, {
        displayName: displayName.trim() ? displayName.trim() : null,
        cycleTrackingEnabled,
        sex: cycleTrackingEnabled && sex.trim() ? sex.trim() : null,
        goalFocus: goalFocus.trim() ? goalFocus.trim() : null,
        weightTrackingEnabled,
        waterUnit,
      });

      const { error: profileErr } = await supabase
        .from("user_profile_preferences")
        .upsert(profilePayload, { onConflict: "user_id" });
      if (profileErr) throw profileErr;

      // 2) Mark onboarding complete for routing / middleware.
      const { error: updateErr } = await supabase.auth.updateUser({
        data: {
          onboarding_complete: true,
          onboarding_focus: goalFocus.trim() ? goalFocus.trim() : null,
        },
      });
      if (updateErr) throw updateErr;

      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
      <Card className="rounded-3xl md:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
          {BRAND.name}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          Welcome — quick profile
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          A few calm choices so Momentum can personalize your tracking and future insights.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <Field label="Display name (optional)" hint="How would you like to be addressed?">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              placeholder="e.g. Anna"
            />
          </Field>

          <ToggleRow
            checked={cycleTrackingEnabled}
            onChange={(v) => setCycleTrackingEnabled(v)}
            title="Enable cycle tracking"
            subtitle="Optional. Turn this on now if you’d like cycle-related fields later."
          />

          {cycleTrackingEnabled ? (
            <Field
              label="Profile label (optional)"
              hint="Used only to support cycle-aware insights later."
            >
              <select
                className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="intersex">Intersex</option>
                <option value="other">Other / specify</option>
              </select>
            </Field>
          ) : null}

          <ToggleRow
            checked={weightTrackingEnabled}
            onChange={(v) => setWeightTrackingEnabled(v)}
            title="Enable weight tracking"
            subtitle="Optional. We’ll show simple weight input + trends. No judgement."
          />

          <Field
            label="Water unit preference"
            hint="We store hydration in a consistent way, but you’ll enter it in your chosen unit."
          >
            <select
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
              value={waterUnit}
              onChange={(e) => setWaterUnit(e.target.value as "ml" | "oz")}
            >
              <option value="oz">oz</option>
              <option value="ml">ml</option>
            </select>
          </Field>

          <Field label="Goal or focus area (optional)" hint="What would you like Momentum to help with most?">
            <input
              type="text"
              value={goalFocus}
              onChange={(e) => setGoalFocus(e.target.value)}
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              placeholder="e.g. recovery, energy, consistency…"
            />
          </Field>

          {error ? <p className="text-sm text-rose">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Saving profile…" : "Continue to dashboard"}
          </button>
        </form>
      </Card>
    </div>
  );
}

