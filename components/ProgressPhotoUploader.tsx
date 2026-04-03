"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MAX_BYTES = 2_000_000; // MVP: keep uploads small (local preview + browser->storage).

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function ProgressPhotoUploader({
  photoUrl,
  onReplaceFile,
  onRemovePhoto,
  label = "Progress photo",
  helpText = "A quick snapshot helps you notice changes over time.",
}: {
  photoUrl: string | null;
  onReplaceFile: (file: File) => Promise<void>;
  onRemovePhoto: () => Promise<void>;
  label?: string;
  helpText?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tempPreview, setTempPreview] = useState<string | null>(photoUrl);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setTempPreview(photoUrl), [photoUrl]);

  const canShow = useMemo(() => Boolean(tempPreview), [tempPreview]);

  async function onPickFile(file: File) {
    setError(null);
    setBusy(true);
    if (file.size > MAX_BYTES) {
      setBusy(false);
      setError(
        "Please choose a smaller image (under ~2MB) for a fast MVP upload.",
      );
      return;
    }

    try {
      // Preview first, then upload/save (so the UI feels instant).
      const dataUrl = await fileToDataUrl(file);
      setTempPreview(dataUrl);

      await onReplaceFile(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload that photo.");
    } finally {
      setBusy(false);
    }
  }

  function onDropFile(file?: File) {
    setDragActive(false);
    if (file) void onPickFile(file);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{helpText}</p>
        <p className="mt-2 text-[11px] text-ink-faint">
          Stored securely in Supabase storage for authenticated users.
        </p>
      </div>

      {canShow ? (
        <div className="rounded-3xl border border-accent-muted/60 bg-white/70 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tempPreview ?? undefined}
            alt="Progress photo preview"
            className="aspect-[3/4] w-full rounded-2xl object-cover shadow-soft"
          />

          {error ? <p className="mt-2 text-sm text-rose">{error}</p> : null}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-2xl border border-accent-muted/60 bg-canvas-subtle px-4 py-2 text-sm font-medium text-ink hover:bg-canvas-subtle/80 disabled:opacity-60"
            >
              {busy ? "Updating..." : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setBusy(true);
                void (async () => {
                  try {
                    await onRemovePhoto();
                    setTempPreview(null);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not remove photo.");
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
              disabled={busy}
              className="rounded-2xl border border-accent-muted/60 bg-white px-4 py-2 text-sm font-medium text-ink-muted hover:bg-canvas-subtle/60 disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-3xl border bg-white/70 p-4 transition-colors ${
            dragActive
              ? "border-accent ring-2 ring-accent/20"
              : "border-accent-muted/60"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            onDropFile(e.dataTransfer.files?.[0]);
          }}
        >
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-canvas-subtle text-accent">
              {/* camera icon */}
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path
                  d="M9 7l1.2-2h3.6L15 7h3a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 17a4 4 0 100-8 4 4 0 000 8z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <p className="text-center text-sm font-medium text-ink">
              Add a progress photo
            </p>
            <p className="text-center text-xs text-ink-muted">
              Choose a photo from your phone or computer.
            </p>
            <p className="hidden text-[11px] text-ink-faint md:block">
              Drag and drop an image here, or browse.
            </p>

            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="w-full rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
              >
                {busy ? "Uploading..." : "Upload from device"}
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="w-full rounded-2xl border border-accent-muted/60 bg-canvas-subtle px-5 py-2.5 text-sm font-medium text-ink md:hidden disabled:opacity-60"
              >
                Open camera / gallery
              </button>
            </div>
          </div>

          {error ? <p className="mt-3 text-sm text-rose">{error}</p> : null}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onPickFile(file);
          // Allow uploading the same file again later.
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

