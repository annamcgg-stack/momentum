"use client";

/**
 * Home = Today’s dashboard. Opens here by default (app/page.tsx).
 */

import { DailyCheckIn } from "@/components/DailyCheckIn";
import { useEntries } from "@/hooks/useEntries";
import { todayKey, emptyEntry } from "@/lib/entry-utils";

export default function TodayPage() {
  const { map, ready, save } = useEntries();
  const date = todayKey();
  const initial = map[date] ?? emptyEntry(date);

  if (!ready) {
    return (
      <div className="animate-pulse space-y-4 py-8">
        <div className="h-10 rounded-xl bg-canvas-subtle" />
        <div className="h-40 rounded-3xl bg-canvas-subtle" />
        <div className="h-40 rounded-3xl bg-canvas-subtle" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
<DailyCheckIn
  date={date}
  initial={initial}
  onSave={async (entry) => {
    await save(date, entry);
  }}
/>
      <p className="pb-4 text-center text-xs text-ink-faint">
        Progress comes from consistency — see trends on the Progress tab.
      </p>
    </div>
  );
}
