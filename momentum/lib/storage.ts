/**
 * Browser persistence for MVP. Swap this module later for API + auth without changing UI much.
 * Storage key is versioned so you can migrate schema later.
 */

import type { DailyEntry, DateKey } from "./types";
import { MOCK_ENTRIES } from "./mock-data";
import { emptyEntry, mergeEntry } from "./entry-utils";

const STORAGE_KEY = "momentum:dailyEntries:v1";
const ML_PER_OZ = 29.5735;

export type EntriesMap = Record<DateKey, DailyEntry>;

function loadRaw(): EntriesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as EntriesMap;
    if (!parsed || typeof parsed !== "object") return {};
    // Schema normalization for MVP migrations (new fields may be missing).
    const normalized: EntriesMap = {};
    for (const [date, entry] of Object.entries(parsed)) {
      const e = entry as Partial<DailyEntry> & { waterOz?: number | null };
      const rawWater = e.waterIntake ?? e.waterOz ?? null;
      // Heuristic: legacy localStorage stored water as oz (values like 48/64).
      // Now we store standardized water in ml; if it looks like oz, convert.
      const waterMl =
        rawWater == null ? null : rawWater > 200 ? rawWater : rawWater * ML_PER_OZ;
      normalized[date] = {
        ...emptyEntry(date),
        ...e,
        date,
        waterIntake: waterMl,
        progressPhotoUrl: e.progressPhotoUrl ?? null,
        progressPhoto: e.progressPhoto ?? null,
        progressPhotoPath: e.progressPhotoPath ?? null,
        restDay: e.restDay ?? false,
        cyclePhase: e.cyclePhase ?? null,
        stressLevel: e.stressLevel ?? null,
        sorenessLevel: e.sorenessLevel ?? null,
        energy: e.energy ?? null,
        weightKg: e.weightKg ?? null,
      };
    }
    return normalized;
  } catch {
    return {};
  }
}

function saveRaw(map: EntriesMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Full map (for hooks). */
export function getAllEntries(): EntriesMap {
  return loadRaw();
}

export function getEntry(date: DateKey): DailyEntry {
  const map = loadRaw();
  return map[date] ?? emptyEntry(date);
}

export function upsertEntry(date: DateKey, patch: Partial<DailyEntry>): DailyEntry {
  const map = loadRaw();
  const prev = map[date] ?? emptyEntry(date);
  const next = mergeEntry(prev, patch);
  map[date] = next;
  saveRaw(map);
  return next;
}

/** One-time dev-friendly seed so Progress/History look populated. Safe to call from client once. */
export function seedMockDataIfEmpty(): void {
  if (typeof window === "undefined") return;
  const existing = loadRaw();
  if (Object.keys(existing).length > 0) return;
  const map: EntriesMap = { ...MOCK_ENTRIES };
  saveRaw(map);
}

export function clearAllEntries(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
