/**
 * Branding & copy in one place — easy for beginners to tweak names, taglines, and encouragement.
 * Colours also live in tailwind.config.ts under theme.extend.colors.
 */

export const BRAND = {
  /** Placeholder app name; rename when you pick a final name */
  name: "Momentum",
  tagline: "Wellness & performance, one day at a time.",
  quotes: [
    "Small steps build momentum.",
    "Progress comes from consistency.",
    "Recovery is part of the plan.",
  ] as const,
};

/** Keys used when computing “how complete is today’s check-in” */
export const TRACKED_FIELD_KEYS = [
  "workoutCompleted",
  "workoutIntensity",
  "sleepHours",
  "sleepQuality",
  "steps",
  "mood",
  "energy",
  "waterIntake",
  "notes",
  "progressPhoto",
] as const;

export type TrackedFieldKey = (typeof TRACKED_FIELD_KEYS)[number];
