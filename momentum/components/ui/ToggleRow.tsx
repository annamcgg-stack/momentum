"use client";

/**
 * Satisfying workout toggle row with check affordance.
 */

export function ToggleRow({
  checked,
  onChange,
  title,
  subtitle,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-4 rounded-2xl border border-accent-muted/70 bg-white/60 p-4 text-left transition-colors hover:bg-white"
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          checked
            ? "border-sage bg-sage text-white"
            : "border-accent-soft bg-white text-transparent"
        }`}
      >
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden>
          <path
            d="M2 6l3 3 5-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-sm text-ink-muted">{subtitle}</span>
        ) : null}
      </span>
    </button>
  );
}
