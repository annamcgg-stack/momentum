"use client";

import { useEffect } from "react";

interface CompareItem {
  src: string;
  label: string;
}

export function ProgressPhotoCompareModal({
  left,
  right,
  onClose,
}: {
  left: CompareItem;
  right: CompareItem;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Compare progress photos"
    >
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close" />

      <div className="relative w-full max-w-4xl rounded-3xl bg-canvas p-3 shadow-soft md:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-display text-base font-semibold text-ink">Compare progress photos</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/75 px-3 py-1 text-xs font-medium text-ink"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[left, right].map((item) => (
            <div key={item.label} className="rounded-2xl border border-accent-muted/60 bg-white/70 p-2">
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                {item.label}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={`Progress photo ${item.label}`}
                className="max-h-[62vh] w-full rounded-xl object-contain bg-canvas-subtle"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

