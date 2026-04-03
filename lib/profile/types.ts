export interface UserProfilePreferences {
  userId: string;
  /** Optional name shown in the UI (kept simple + non-medical). */
  displayName: string | null;
  /** Master toggle for whether cycle fields are visible in the app. */
  cycleTrackingEnabled: boolean;
  /** Optional physiology label used when cycle tracking is enabled. Free text for flexibility. */
  sex: string | null;
  /** Optional goal / focus area used for future personalized insight copy. */
  goalFocus: string | null;
  /** If true, show weight field + weight trends in Progress/History. */
  weightTrackingEnabled: boolean;
  /** Preferred hydration display unit (values are stored standardized in ml internally). */
  waterUnit: "ml" | "oz";
  updatedAt: string;
}

export const DEFAULT_USER_PROFILE_PREFERENCES: Omit<
  UserProfilePreferences,
  "userId" | "updatedAt"
> = {
  displayName: null,
  cycleTrackingEnabled: false,
  sex: null,
  goalFocus: null,
  weightTrackingEnabled: false,
  waterUnit: "ml",
};

