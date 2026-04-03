"use client";

/**
 * Lightweight bar chart (no chart library). Heights 0–1 per metric for last 7 days.
 */

export function MiniBars({
  labels,
  values,
  caption,
  colorClass = "bg-accent/80",
}: {
  labels: string[];
  values: number[];
  caption: string;
  colorClass?: string;
}) {
  const max = Math.max(0.0001, ...values);
  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
        {caption}
      </p>
      <div className="flex h-28 items-end justify-between gap-2">
        {values.map((v, i) => {
          const px = Math.max(6, Math.round((v / max) * 88));
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`w-full max-w-8 rounded-t-lg ${colorClass} transition-all`}
                style={{ height: px }}
                title={`${labels[i]}: ${v.toFixed(1)}`}
              />
              <span className="text-[10px] text-ink-faint">{labels[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
