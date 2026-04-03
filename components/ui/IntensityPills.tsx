"use client";

import type { WorkoutIntensity } from "@/lib/types";

const options: { key: WorkoutIntensity; label: string }[] = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
];

export function IntensityPills({
  value,
  onChange,
}: {
  value: WorkoutIntensity | null;
  onChange: (v: WorkoutIntensity | null) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">Workout intensity</p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ key, label }) => {
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(active ? null : key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-ink text-white"
                  : "bg-canvas-subtle text-ink-muted hover:bg-accent-muted/60"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
