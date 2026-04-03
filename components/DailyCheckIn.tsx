"use client";

/**
 * Today’s check-in form. Persists via the onSave hook (Supabase-backed).
 * To add/remove fields: edit DailyEntry in lib/types.ts, TRACKED_FIELD_KEYS in lib/theme.ts, and this component.
 */

import { useEffect, useMemo, useState } from "react";
import type { DailyEntry } from "@/lib/types";
import { BRAND } from "@/lib/theme";
import { completionFraction, emptyEntry, mergeEntry } from "@/lib/entry-utils";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { IntensityPills } from "@/components/ui/IntensityPills";
import { RatingDots } from "@/components/ui/RatingDots";
import { Field } from "@/components/ui/Field";
import { ProgressPhotoUploader } from "@/components/ProgressPhotoUploader";
import { ProgressPhotoModal } from "@/components/ProgressPhotoModal";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useUserProfilePreferences } from "@/hooks/useUserProfilePreferences";
import { getSupabaseClient } from "@/lib/supabase/browserClient";

const WORKOUT_TYPES = ["Strength", "Run", "Walk", "Yoga", "Sport", "Other"];

export function DailyCheckIn({
  date,
  initial,
  onSave,
}: {
  date: string;
  initial: DailyEntry;
  onSave: (patch: Partial<DailyEntry>) => void;
}) {
  const [draft, setDraft] = useState<DailyEntry>(() => initial ?? emptyEntry(date));
  const [showPhoto, setShowPhoto] = useState(false);
  const { user } = useSupabaseUser();
  const userId = user?.id ?? null;
  const { prefs: profilePrefs, ready: profileReady } = useUserProfilePreferences(userId);
  const showCyclePhaseField = profileReady && Boolean(profilePrefs?.cycleTrackingEnabled);
  const showWeightField = profileReady && Boolean(profilePrefs?.weightTrackingEnabled);
  const waterUnit = profilePrefs?.waterUnit ?? "oz";
  const ML_PER_OZ = 29.5735;
  const waterDisplayValue =
    draft.waterIntake == null
      ? ""
      : waterUnit === "ml"
        ? draft.waterIntake
        : draft.waterIntake / ML_PER_OZ;

  useEffect(() => {
    setDraft(initial ?? emptyEntry(date));
  }, [initial, date]);

  const fraction = useMemo(() => completionFraction(draft), [draft]);

  function patch(p: Partial<DailyEntry>) {
    const next = mergeEntry(draft, p);
    setDraft(next);
    onSave(p);
  }

  async function replaceProgressPhoto(file: File) {
    if (!user) throw new Error("Please log in to upload a progress photo.");
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured yet.");
    const BUCKET = "progress-photos";
    const oldPath = draft.progressPhotoPath;

    const ext = file.type.split("/")[1] || "jpg";
    const newPath = `${user.id}/${date}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, file, { contentType: file.type, upsert: true });
    if (uploadErr) throw uploadErr;

    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(newPath, 60 * 60);
    const signedUrl = signed?.signedUrl ?? null;
    if (!signedUrl) throw new Error("Could not create a signed photo URL.");

    patch({ progressPhotoPath: newPath, progressPhoto: signedUrl });

    if (oldPath && oldPath !== newPath) {
      // Best-effort cleanup of the previous object (replacement).
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }
  }

  async function removeProgressPhoto() {
    if (!user) throw new Error("Please log in to remove a progress photo.");
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured yet.");
    const BUCKET = "progress-photos";
    const oldPath = draft.progressPhotoPath;
    if (oldPath) {
      const { error: removeErr } = await supabase.storage
        .from(BUCKET)
        .remove([oldPath]);
      if (removeErr) throw removeErr;
    }
    patch({ progressPhotoPath: null, progressPhoto: null });
  }

  const prettyDate = useMemo(() => {
    const [y, m, d] = date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, [date]);

  const quote =
    BRAND.quotes[date.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % BRAND.quotes.length];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold text-ink">Today</p>
          <p className="text-sm text-ink-muted">{prettyDate}</p>
          <p className="mt-3 text-sm italic text-ink-muted">“{quote}”</p>
        </div>
        <ProgressRing fraction={fraction} />
      </div>

      <Card>
        <h2 className="mb-4 font-display text-lg text-ink">Sleep & recovery</h2>
        <div className="space-y-5">
          <Field label="Sleep (hours)" hint="Rough estimate is fine.">
            <input
              type="number"
              min={0}
              max={24}
              step={0.25}
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
              value={draft.sleepHours ?? ""}
              onChange={(e) =>
                patch({
                  sleepHours: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
         
          <RatingDots
            label="Sleep quality"
            value={draft.sleepQuality}
            onChange={(sleepQuality) => patch({ sleepQuality })}
          />

          <RatingDots
            label="Stress"
            value={draft.stressLevel}
            onChange={(stressLevel) => patch({ stressLevel })}
          />

          <RatingDots
            label="Muscle soreness"
            value={draft.sorenessLevel}
            onChange={(sorenessLevel) => patch({ sorenessLevel })}
          />

          {showCyclePhaseField ? (
            <Field
              label="Cycle phase (optional)"
              hint="Free text for your own tracking; unlocks smarter insights later."
            >
              <input
                type="text"
                className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent outline-none"
                placeholder="e.g. day 5, follicular, luteal — or skip"
                value={draft.cyclePhase ?? ""}
                onChange={(e) =>
                  patch({
                    // Preserve the user's exact typing (including spaces).
                    // Only treat completely empty input as unset.
                    cyclePhase: e.target.value.length === 0 ? null : e.target.value,
                  })
                }
              />
            </Field>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg text-ink">Energy & activity</h2>
        <div className="space-y-5">
          <Field label="Steps or activity" hint="Steps, minutes, or your preferred metric.">
            <input
              type="number"
              min={0}
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
              value={draft.steps ?? ""}
              onChange={(e) =>
                patch({
                  steps: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>

          <RatingDots
            label="Mood"
            value={draft.mood}
            onChange={(mood) => patch({ mood })}
          />

          <RatingDots
            label="Energy"
            value={draft.energy}
            onChange={(energy) => patch({ energy })}
          />

          <Field
            label={`Water intake (optional, ${waterUnit})`}
            hint={`Enter in ${waterUnit}. We store hydration in a consistent way for future trends.`}
          >
            <input
              type="number"
              min={0}
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
              value={waterDisplayValue}
              onChange={(e) => {
                const raw = e.target.value === "" ? null : Number(e.target.value);
                patch({
                  // Store standardized hydration in ml internally.
                  waterIntake:
                    raw == null ? null : waterUnit === "ml" ? raw : raw * ML_PER_OZ,
                });
              }}
            />
          </Field>

          {showWeightField ? (
            <Field
              label="Weight (optional)"
              hint="If enabled, you’ll see simple weight trends (used alongside recovery)."
            >
              <input
                type="number"
                min={0}
                step={0.1}
                className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink focus:border-accent outline-none"
                value={draft.weightKg ?? ""}
                onChange={(e) =>
                  patch({
                    weightKg: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg text-ink">Training & activity</h2>
        <div className="space-y-4">
          <ToggleRow
            checked={draft.workoutCompleted}
            onChange={(workoutCompleted) => patch({ workoutCompleted })}
            title="Workout completed"
            subtitle="Tick when you trained — rest days count too when you honour recovery."
          />

          <Field label="Workout type (optional)" hint="Pick a preset or write your own.">
            <input
              type="text"
              list="workout-presets"
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent outline-none"
              placeholder="Strength, run, yoga…"
              value={draft.workoutType}
              onChange={(e) => patch({ workoutType: e.target.value })}
            />
            <datalist id="workout-presets">
              {WORKOUT_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>

          <IntensityPills
            value={draft.workoutIntensity}
            onChange={(workoutIntensity) => patch({ workoutIntensity })}
          />

          <ToggleRow
            checked={draft.restDay}
            onChange={(restDay) => patch({ restDay })}
            title="Rest / recovery day"
            subtitle="Mark when you’re intentionally off training — helps future recovery insights."
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg text-ink">Notes</h2>
        <textarea
          rows={3}
          className="w-full resize-none rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent outline-none"
          placeholder="A line about how today felt…"
          value={draft.notes}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </Card>

      <Card>
        <h2 className="mb-2 font-display text-lg text-ink">Progress photo</h2>
        {draft.progressPhoto ? (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-accent-muted/60 bg-canvas-subtle/70 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.progressPhoto}
              alt="Today's progress thumbnail"
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Photo saved for today</p>
              <p className="truncate text-xs text-ink-faint">Tap view to check your thumbnail.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPhoto(true)}
              className="rounded-xl border border-accent-muted/60 bg-white px-3 py-1.5 text-xs font-medium text-ink"
            >
              View
            </button>
          </div>
        ) : (
          <p className="mb-3 text-xs text-ink-faint">
            No photo yet for this day. A quick snapshot can make progress more visible.
          </p>
        )}
        <ProgressPhotoUploader
          photoUrl={draft.progressPhoto ?? null}
          onReplaceFile={replaceProgressPhoto}
          onRemovePhoto={removeProgressPhoto}
        />
      </Card>

      {showPhoto && draft.progressPhoto ? (
        <ProgressPhotoModal
          src={draft.progressPhoto}
          title={`Progress photo — ${prettyDate}`}
          onClose={() => setShowPhoto(false)}
        />
      ) : null}
    </div>
  );
}
