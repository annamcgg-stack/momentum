"use client";

import Link from "next/link";
import { BRAND } from "@/lib/theme";

const points = [
  "Track workouts, sleep, recovery, mood, and consistency each day.",
  "See weekly progress, trends, and simple insights.",
  "Keep private progress photos and compare over time.",
];

export default function WelcomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <section className="overflow-hidden rounded-3xl border border-accent-muted/60 bg-white/70 p-6 shadow-card md:p-10">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
          Welcome to {BRAND.name}
        </p>
        <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl">
          Build momentum through
          <br />
          calm daily consistency.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
          A minimal wellness and performance tracker designed to feel motivating,
          private, and easy to stick with on mobile and desktop.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {points.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-accent-muted/50 bg-canvas-subtle/60 p-4"
            >
              <p className="text-sm text-ink">{point}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-accent-muted/70 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-canvas-subtle/70"
          >
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}

