/**
 * Sample entries for a polished first-time UI. Seeded only when storage is empty (see storage.ts).
 */

import type { DailyEntry } from "./types";
import { formatDateKey } from "./entry-utils";

const ML_PER_OZ = 29.5735;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDateKey(d);
}

// Small inline placeholder image for UI preview (MVP-friendly SVG data URL).
const SAMPLE_PHOTO = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#EDE7DD"/>
      <stop offset="1" stop-color="#D9CFC2"/>
    </linearGradient>
  </defs>
  <rect width="720" height="960" rx="48" fill="url(#g)"/>
  <rect x="48" y="48" width="624" height="864" rx="40" fill="#ffffff80" stroke="#2C282533"/>
  <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle"
        font-family="ui-sans-serif, system-ui" font-size="44" fill="#2C2825" font-weight="700">
    Progress photo
  </text>
  <text x="50%" y="52.5%" dominant-baseline="middle" text-anchor="middle"
        font-family="ui-sans-serif, system-ui" font-size="26" fill="#6B6560">
    Placeholder for MVP
  </text>
</svg>
`)}`;

export const MOCK_ENTRIES: Record<string, DailyEntry> = {
  [daysAgo(6)]: {
    date: daysAgo(6),
    workoutCompleted: true,
    workoutType: "Strength",
    workoutIntensity: "medium",
    sleepHours: 7,
    sleepQuality: 4,
    steps: 8200,
    mood: 4,
    energy: 4,
    waterIntake: 64 * ML_PER_OZ,
    weightKg: null,
    notes: "Felt strong today.",
    progressPhoto: null,
    progressPhotoPath: null,
    progressPhotoUrl: null,
    stressLevel: 2,
    sorenessLevel: 3,
    restDay: false,
    cyclePhase: null,
    updatedAt: new Date().toISOString(),
  },
  [daysAgo(5)]: {
    date: daysAgo(5),
    workoutCompleted: false,
    workoutType: "",
    workoutIntensity: null,
    sleepHours: 6,
    sleepQuality: 3,
    steps: 5400,
    mood: 3,
    energy: 3,
    waterIntake: 48 * ML_PER_OZ,
    weightKg: null,
    notes: "",
    progressPhoto: null,
    progressPhotoPath: null,
    progressPhotoUrl: null,
    stressLevel: 3,
    sorenessLevel: 2,
    restDay: true,
    cyclePhase: null,
    updatedAt: new Date().toISOString(),
  },
  [daysAgo(4)]: {
    date: daysAgo(4),
    workoutCompleted: true,
    workoutType: "Run",
    workoutIntensity: "high",
    sleepHours: 7.5,
    sleepQuality: 5,
    steps: 12000,
    mood: 5,
    energy: 5,
    waterIntake: 72 * ML_PER_OZ,
    weightKg: null,
    notes: "Great sleep last night.",
    progressPhoto: SAMPLE_PHOTO,
    progressPhotoPath: null,
    progressPhotoUrl: null,
    stressLevel: 2,
    sorenessLevel: 4,
    restDay: false,
    cyclePhase: null,
    updatedAt: new Date().toISOString(),
  },
  [daysAgo(3)]: {
    date: daysAgo(3),
    workoutCompleted: true,
    workoutType: "Yoga",
    workoutIntensity: "low",
    sleepHours: 8,
    sleepQuality: 4,
    steps: 6800,
    mood: 4,
    energy: 3,
    waterIntake: 56 * ML_PER_OZ,
    weightKg: null,
    notes: "",
    progressPhoto: null,
    progressPhotoPath: null,
    progressPhotoUrl: null,
    stressLevel: 2,
    sorenessLevel: 2,
    restDay: false,
    cyclePhase: null,
    updatedAt: new Date().toISOString(),
  },
  [daysAgo(2)]: {
    date: daysAgo(2),
    workoutCompleted: false,
    workoutType: "",
    workoutIntensity: null,
    sleepHours: 5.5,
    sleepQuality: 2,
    steps: 4100,
    mood: 2,
    energy: 2,
    waterIntake: 32 * ML_PER_OZ,
    weightKg: null,
    notes: "Travel day — off routine.",
    progressPhoto: null,
    progressPhotoPath: null,
    progressPhotoUrl: null,
    stressLevel: 4,
    sorenessLevel: 1,
    restDay: false,
    cyclePhase: null,
    updatedAt: new Date().toISOString(),
  },
  [daysAgo(1)]: {
    date: daysAgo(1),
    workoutCompleted: true,
    workoutType: "Strength",
    workoutIntensity: "medium",
    sleepHours: 7,
    sleepQuality: 4,
    steps: 9100,
    mood: 4,
    energy: 4,
    waterIntake: 64 * ML_PER_OZ,
    weightKg: null,
    notes: "",
    progressPhoto: null,
    progressPhotoPath: null,
    progressPhotoUrl: null,
    stressLevel: 2,
    sorenessLevel: 3,
    restDay: false,
    cyclePhase: null,
    updatedAt: new Date().toISOString(),
  },
};
