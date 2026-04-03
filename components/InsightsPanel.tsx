"use client";

import { generateInsights, type Insight } from "@/lib/insights";
import type { EntriesMap } from "@/lib/storage";
import { Card } from "@/components/ui/Card";

const toneStyles: Record<Insight["tone"], string> = {
  positive: "border-sage/40 bg-sage-soft/40",
  neutral: "border-accent-muted/60 bg-canvas-subtle/80",
  gentle: "border-rose-soft bg-rose-soft/50",
};

export function InsightsPanel({
  map,
  title = "Insights",
  subtitle = "Simple patterns from your last two weeks — no cloud AI.",
  hideHeading = false,
}: {
  map: EntriesMap;
  title?: string;
  subtitle?: string;
  hideHeading?: boolean;
}) {
  const insights = generateInsights(map);

  return (
    <Card>
      {!hideHeading ? (
        <>
          <h2 className="mb-1 font-display text-lg text-ink">{title}</h2>
          <p className="mb-4 text-sm text-ink-muted">{subtitle}</p>
        </>
      ) : null}
      <ul className="space-y-3">
        {insights.map((ins) => (
          <li
            key={ins.id}
            className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed text-ink ${toneStyles[ins.tone]}`}
          >
            {ins.text}
          </li>
        ))}
      </ul>
    </Card>
  );
}
