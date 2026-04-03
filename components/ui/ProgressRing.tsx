"use client";

/**
 * SVG ring showing 0–100% completion. Used on Today to reward finishing the check-in.
 */

export function ProgressRing({
  fraction,
  size = 112,
  stroke = 7,
}: {
  fraction: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, fraction)));

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-accent-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-semibold text-ink">
          {Math.round(fraction * 100)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
          done
        </span>
      </div>
    </div>
  );
}
