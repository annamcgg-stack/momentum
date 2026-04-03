"use client";

/**
 * Reminder & notification preferences — stored per user in Supabase.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { Field } from "@/components/ui/Field";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";
import { useUserProfilePreferences } from "@/hooks/useUserProfilePreferences";
import {
  browserReminderChannel,
  getToneDescription,
  type ReminderFrequency,
  type ReminderTone,
} from "@/lib/reminders";

const TONES: ReminderTone[] = ["gentle", "motivating", "accountability"];

export default function SettingsPage() {
  const { user } = useSupabaseUser();
  const userId = user?.id ?? null;
  const { prefs, ready, save, detectTimeZone } = useReminderPreferences(userId);
  const {
    prefs: profilePrefs,
    ready: profileReady,
    save: saveProfile,
  } = useUserProfilePreferences(userId);

  const [draft, setDraft] = useState({
    remindersEnabled: false,
    reminderTime: "09:00",
    reminderFrequency: "daily" as ReminderFrequency,
    reminderTone: "gentle" as ReminderTone,
    timezone: "UTC",
    cycleTrackingEnabled: false,
    weightTrackingEnabled: false,
    waterUnit: "oz" as "ml" | "oz",
  });

  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; text: string } | null>(
    null,
  );
  const [permHint, setPermHint] = useState<string | null>(null);

  useEffect(() => {
    if (!prefs) return;
    setDraft((d) => ({
      ...d,
      remindersEnabled: prefs.remindersEnabled,
      reminderTime: prefs.reminderTime,
      reminderFrequency: prefs.reminderFrequency,
      reminderTone: prefs.reminderTone,
      timezone: prefs.timezone,
        cycleTrackingEnabled:
          profilePrefs?.cycleTrackingEnabled ?? d.cycleTrackingEnabled,
        weightTrackingEnabled:
          profilePrefs?.weightTrackingEnabled ?? d.weightTrackingEnabled,
        waterUnit: profilePrefs?.waterUnit ?? d.waterUnit,
    }));
  }, [prefs, profilePrefs]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    setPermHint(null);
    setSaving(true);

    try {
      if (draft.remindersEnabled && browserReminderChannel.isSupported()) {
        const current =
          typeof Notification !== "undefined" ? Notification.permission : "denied";
        if (current === "default") {
          const result = await browserReminderChannel.requestPermission?.();
          if (result === "denied") {
            setPermHint(
              "Browser notifications are blocked. You can enable them in your site settings to get nudges while Momentum is open.",
            );
          }
        } else if (current === "denied") {
          setPermHint(
            "Notifications are off in your browser. Reminders will work once you allow them for this site.",
          );
        }
      }

      const [result, profileResult] = await Promise.all([
        save({
          remindersEnabled: draft.remindersEnabled,
          reminderTime: draft.reminderTime,
          reminderFrequency: draft.reminderFrequency,
          reminderTone: draft.reminderTone,
          timezone: draft.timezone,
        }),
        saveProfile({
          cycleTrackingEnabled: draft.cycleTrackingEnabled,
          weightTrackingEnabled: draft.weightTrackingEnabled,
          waterUnit: draft.waterUnit,
        }),
      ]);

      if (!result.ok) {
        setBanner({ kind: "error", text: result.error ?? "Could not save reminders." });
        return;
      }
      if (!profileResult.ok) {
        setBanner({
          kind: "error",
          text: profileResult.error ?? "Could not save profile settings.",
        });
        return;
      }

      if (draft.remindersEnabled) {
        setBanner({
          kind: "success",
          text: `Reminders are on. We’ll nudge you around ${formatTimeLabel(
            draft.reminderTime,
          )} (${draft.timezone}) on days you’re due for a check-in — optional, and you can turn this off anytime.`,
        });
      } else {
        setBanner({
          kind: "success",
          text: draft.cycleTrackingEnabled
            ? "Preferences saved. Reminders are off, but cycle tracking is enabled."
            : "Preferences saved. Reminders are off, and cycle tracking is disabled.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  if (!ready || !profileReady) {
    return (
      <div className="py-12 text-center text-sm text-ink-muted">Loading settings…</div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          ← Back to Today
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
          Preferences
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          Optional daily nudges to complete your check-in, plus cycle tracking you can toggle on/off.
          You control the time and tone — we’ll layer in email and push later without changing this screen.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {banner ? (
          <div
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
              banner.kind === "success"
                ? "border-sage/40 bg-sage/10 text-ink"
                : "border-red-200/80 bg-red-50/90 text-red-900"
            }`}
          >
            {banner.text}
          </div>
        ) : null}

        {permHint ? (
          <p className="rounded-2xl border border-accent-muted/60 bg-canvas-subtle/80 px-4 py-3 text-sm text-ink-muted">
            {permHint}
          </p>
        ) : null}

        <Card>
          <h2 className="font-display text-lg text-ink">Daily check-in reminders</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Stay consistent with a single gentle ping at the time you pick — only on days your
            check-in still looks light.
          </p>

          <div className="mt-5 space-y-5">
            <ToggleRow
              checked={draft.remindersEnabled}
              onChange={(remindersEnabled) => setDraft((d) => ({ ...d, remindersEnabled }))}
              title="Enable reminders"
              subtitle="Totally optional. We never spam — one daily window when you choose."
            />

            <Field label="Reminder time" hint="Uses your timezone below.">
              <input
                type="time"
                className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
                value={draft.reminderTime}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, reminderTime: e.target.value.slice(0, 5) }))
                }
              />
            </Field>

            <Field
              label="Frequency"
              hint="More patterns (weekdays only, weekly digest) can plug in here later."
            >
              <select
                className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
                value={draft.reminderFrequency}
                disabled
                aria-disabled="true"
              >
                <option value="daily">Daily</option>
              </select>
            </Field>

            <Field label="Timezone" hint="Used to line up your reminder with local clock.">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  readOnly
                  className="w-full flex-1 rounded-2xl border border-accent-muted/60 bg-canvas-subtle/80 px-4 py-3 text-sm text-ink"
                  value={draft.timezone}
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, timezone: detectTimeZone() }))
                  }
                  className="shrink-0 rounded-2xl border border-accent-muted/70 bg-white px-4 py-3 text-sm font-medium text-ink hover:bg-canvas-subtle"
                >
                  Use this device
                </button>
              </div>
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Cycle tracking</h2>
          <p className="mt-1 text-sm text-ink-muted">
            If you enable cycle tracking, the cycle phase field will appear in your daily check-in.
            You can change this anytime in Settings.
          </p>
          <div className="mt-5 space-y-5">
            <ToggleRow
              checked={draft.cycleTrackingEnabled}
              onChange={(cycleTrackingEnabled) =>
                setDraft((d) => ({ ...d, cycleTrackingEnabled }))
              }
              title="Enable cycle tracking"
              subtitle="Hide cycle fields completely when off."
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Weight & hydration</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Keep the daily experience performance-first. Weight is optional, and water input uses
            your unit preference.
          </p>
          <div className="mt-5 space-y-5">
            <ToggleRow
              checked={draft.weightTrackingEnabled}
              onChange={(weightTrackingEnabled) =>
                setDraft((d) => ({ ...d, weightTrackingEnabled }))
              }
              title="Enable weight tracking"
              subtitle="Optional. We’ll show a simple weight input + trends."
            />

            <Field label="Preferred water unit" hint="Used in the daily check-in input only.">
              <select
                className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
                value={draft.waterUnit}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    waterUnit: e.target.value as "ml" | "oz",
                  }))
                }
              >
                <option value="oz">oz</option>
                <option value="ml">ml</option>
              </select>
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Reminder tone</h2>
          <p className="mt-1 text-sm text-ink-muted">
            How should we phrase your nudge? You can change this anytime.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {TONES.map((tone) => {
              const selected = draft.reminderTone === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, reminderTone: tone }))}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    selected
                      ? "border-sage bg-sage/10 shadow-soft"
                      : "border-accent-muted/70 bg-white/60 hover:bg-white"
                  }`}
                >
                  <span className="block font-medium capitalize text-ink">{tone}</span>
                  <span className="mt-1 block text-xs text-ink-muted">
                    {getToneDescription(tone)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white shadow-soft transition-opacity disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </form>
    </div>
  );
}

function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h)) return hhmm;
  const d = new Date();
  d.setHours(h, m ?? 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
