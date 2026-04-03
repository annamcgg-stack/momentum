"use client";

import { useEffect } from "react";

export function ProgressPhotoModal({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-canvas p-3 shadow-soft">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="truncate font-display text-sm font-semibold text-ink">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-ink hover:bg-white"
          >
            Close
          </button>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} className="max-h-[70vh] w-full rounded-2xl object-contain bg-white/70" />
      </div>
    </div>
  );
}

