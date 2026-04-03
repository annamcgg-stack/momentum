"use client";

/**
 * 1–5 scale: sleep quality, mood/energy. Accessible as a row of buttons.
 */

export function RatingDots({
  value,
  onChange,
  label,
  max = 5,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  label: string;
  max?: number;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(active ? null : n)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                active
                  ? "bg-accent text-white shadow-soft scale-105"
                  : "bg-canvas-subtle text-ink-muted hover:bg-accent-muted/80"
              }`}
              aria-pressed={active}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
