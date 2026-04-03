"use client";

/**
 * Calendar + list of past entries. Tap a day conceptually via list (compact for MVP).
 */

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useEntries } from "@/hooks/useEntries";
import {
  completionFraction,
  formatDateKey,
  parseDateKey,
  workoutIntensityLabel,
} from "@/lib/entry-utils";
import type { DailyEntry } from "@/lib/types";
import { ProgressPhotoModal } from "@/components/ProgressPhotoModal";
import { ProgressPhotoCompareModal } from "@/components/ProgressPhotoCompareModal";

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function entrySummary(e: DailyEntry): string {
  const parts: string[] = [];
  if (e.restDay) parts.push("Rest day");
  if (e.workoutCompleted) parts.push(e.workoutType ? e.workoutType : "Workout");
  if (e.sleepHours != null) parts.push(`${e.sleepHours}h sleep`);
  if (e.mood != null) parts.push(`mood ${e.mood}/5`);
  if (e.energy != null) parts.push(`energy ${e.energy}/5`);
  if (parts.length === 0) return "Light check-in";
  return parts.join(" · ");
}

export default function HistoryPage() {
  const { map, ready } = useEntries();
  const now = new Date();
  const [cursor, setCursor] = useState(() => ({
    y: now.getFullYear(),
    m: now.getMonth(),
  }));

  const [photoView, setPhotoView] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [compareKeys, setCompareKeys] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const cells = useMemo(
    () => monthGrid(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  );

  const monthLabel = new Date(cursor.y, cursor.m).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const recentKeys = useMemo(() => {
    return Object.keys(map)
      .filter((k) => map[k])
      .sort()
      .reverse()
      .slice(0, 30);
  }, [map]);

  const photoCount = useMemo(() => {
    return Object.keys(map).filter(
      (k) => Boolean(map[k]?.progressPhotoPath && map[k]?.progressPhoto),
    ).length;
  }, [map]);

  function prevMonth() {
    setCursor(({ y, m }) => {
      const nm = m - 1;
      return nm < 0 ? { y: y - 1, m: 11 } : { y, m: nm };
    });
  }

  function nextMonth() {
    setCursor(({ y, m }) => {
      const nm = m + 1;
      return nm > 11 ? { y: y + 1, m: 0 } : { y, m: nm };
    });
  }

  function dateLabel(key: string): string {
    return parseDateKey(key).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function toggleCompareKey(key: string) {
    setCompareKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 2) return [prev[1], key];
      return [...prev, key];
    });
    setCompareOpen(false);
  }

  const compareItems =
    compareKeys.length === 2
      ? compareKeys
          .map((key) => {
            const e = map[key];
            if (!e?.progressPhotoPath || !e?.progressPhoto) return null;
            return { src: e.progressPhoto, label: dateLabel(key) };
          })
          .filter(Boolean)
      : [];

  if (!ready) {
    return (
      <div className="animate-pulse space-y-4 py-8">
        <div className="h-64 rounded-3xl bg-canvas-subtle" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">History</h1>
        <p className="text-sm text-ink-muted">See where you’ve been consistent.</p>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-full px-3 py-1 text-sm text-ink-muted hover:bg-canvas-subtle hover:text-ink"
            aria-label="Previous month"
          >
            ←
          </button>
          <p className="font-medium text-ink">{monthLabel}</p>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-full px-3 py-1 text-sm text-ink-muted hover:bg-canvas-subtle hover:text-ink"
            aria-label="Next month"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-ink-faint">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) {
              return <div key={`e-${i}`} className="aspect-square" />;
            }
            const key = formatDateKey(new Date(cursor.y, cursor.m, d));
            const e = map[key];
            const frac = e ? completionFraction(e) : 0;
            const logged = Boolean(e && frac > 0);
            const hasPhoto = Boolean(e?.progressPhotoPath && e?.progressPhoto);
            const photoTitle = hasPhoto
              ? parseDateKey(key).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "";
            return (
              <div key={key} className="relative">
                {hasPhoto ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoView({
                        src: e!.progressPhoto!,
                        title: `Progress photo — ${photoTitle}`,
                      })
                    }
                    title={e ? `${entrySummary(e)}. Tap to view photo.` : "Tap to view photo"}
                    className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl text-xs ${
                      logged
                        ? "bg-sage-soft/70 font-semibold text-ink"
                        : "bg-canvas-subtle/60 text-ink-muted hover:bg-canvas-subtle/80"
                    }`}
                  >
                    <span>{d}</span>
                    {logged ? (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-sage" />
                    ) : null}
                  </button>
                ) : (
                  <div
                    title={e ? entrySummary(e) : "No log"}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl text-xs ${
                      logged
                        ? "bg-sage-soft/70 font-semibold text-ink"
                        : "bg-canvas-subtle/60 text-ink-muted"
                    }`}
                  >
                    <span>{d}</span>
                    {logged ? (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-sage" />
                    ) : null}
                  </div>
                )}

                {hasPhoto ? (
                  <span className="absolute right-1.5 top-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e?.progressPhoto ?? undefined}
                      alt=""
                      className="h-3.5 w-3.5 rounded-full border border-white/80 object-cover shadow-soft"
                    />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          Dots indicate days with a meaningful check-in. Open <strong>Today</strong> to
          edit the current day.
        </p>

        <p className="mt-2 text-[11px] text-ink-faint">
          {photoCount === 0 ? (
            <>No progress photos saved yet.</>
          ) : (
            <>Tap the camera badge to view a saved photo. Select any 2 photo days to compare.</>
          )}
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 font-display text-lg text-ink">Recent days</h2>
        {photoCount > 0 ? (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-accent-muted/60 bg-canvas-subtle/70 px-3 py-2">
            <p className="text-xs text-ink-muted">
              {compareKeys.length === 0
                ? "Select 2 photo days to compare."
                : `${compareKeys.length}/2 selected`}
            </p>
            <button
              type="button"
              disabled={compareItems.length !== 2}
              onClick={() => setCompareOpen(true)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium ${
                compareItems.length === 2
                  ? "bg-ink text-white"
                  : "bg-white text-ink-faint cursor-not-allowed"
              }`}
            >
              Compare
            </button>
          </div>
        ) : null}
        {recentKeys.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Nothing logged yet — start with today’s dashboard.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentKeys.map((k) => {
              const e = map[k]!;
              const dt = parseDateKey(k);
              const label = dt.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const hasPhoto = Boolean(e.progressPhotoPath && e.progressPhoto);
              const compareSelected = compareKeys.includes(k);
              return (
                <li
                  key={k}
                  className="rounded-2xl border border-accent-muted/50 bg-white/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink">{label}</p>
                    <span className="text-xs text-ink-faint">
                      {Math.round(completionFraction(e) * 100)}% complete
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{entrySummary(e)}</p>
                  {e.workoutIntensity ? (
                    <p className="mt-1 text-xs text-ink-faint">
                      Intensity: {workoutIntensityLabel(e.workoutIntensity)}
                    </p>
                  ) : null}

                  {hasPhoto ? (
                    <div className="mt-3 grid grid-cols-[4rem,1fr] gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoView({
                            src: e.progressPhoto!,
                            title: `Progress photo — ${label}`,
                          })
                        }
                        className="h-16 w-16 overflow-hidden rounded-xl border border-accent-muted/50"
                        aria-label={`View photo for ${label}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.progressPhoto ?? undefined}
                          alt={`Progress thumbnail ${label}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoView({
                              src: e.progressPhoto!,
                              title: `Progress photo — ${label}`,
                            })
                          }
                          className="inline-flex w-full items-center justify-center rounded-xl border border-accent-muted/60 bg-canvas-subtle px-3 py-2 text-xs font-medium text-ink hover:bg-canvas-subtle/80"
                        >
                          View full photo
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCompareKey(k)}
                          className={`inline-flex w-full items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium ${
                            compareSelected
                              ? "border-ink bg-ink text-white"
                              : "border-accent-muted/60 bg-white text-ink-muted"
                          }`}
                        >
                          {compareSelected ? "Selected for compare" : "Select for compare"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {compareItems.length === 2 ? (
        <Card>
          <h3 className="mb-2 font-display text-lg text-ink">Photo compare</h3>
          <p className="mb-3 text-sm text-ink-muted">
            Compare two saved check-ins side by side.
          </p>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="w-full rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
          >
            Open compare view
          </button>
        </Card>
      ) : null}

      {photoView ? (
        <ProgressPhotoModal
          src={photoView.src}
          title={photoView.title}
          onClose={() => setPhotoView(null)}
        />
      ) : null}

      {compareOpen && compareItems.length === 2 ? (
        <ProgressPhotoCompareModal
          left={compareItems[0] as { src: string; label: string }}
          right={compareItems[1] as { src: string; label: string }}
          onClose={() => setCompareOpen(false)}
        />
      ) : null}
    </div>
  );
}
