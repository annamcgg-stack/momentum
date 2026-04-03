/**
 * Rounded surface for grouping content. Keeps shadow and radius consistent app-wide.
 */

import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-accent-muted/60 bg-white/80 p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
