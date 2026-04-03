"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import { BRAND } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const next = "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        const done = Boolean(data.user.user_metadata?.onboarding_complete);
        router.replace(done ? next : "/setup");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
      <div className="overflow-hidden rounded-3xl border border-accent-muted/60 bg-white/70 p-5 shadow-card md:p-7">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
            {BRAND.name}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Welcome back. Small steps build momentum.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-2xl border border-accent-muted/60 bg-canvas-subtle/60 p-1 text-xs">
          <span className="rounded-xl bg-white px-3 py-2 text-center font-semibold text-ink shadow-soft">
            Log in
          </span>
          <Link
            href="/signup"
            className="rounded-xl px-3 py-2 text-center font-medium text-ink-muted hover:text-ink"
          >
            Sign up
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-accent-muted/80 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="text-sm text-rose">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center text-xs text-ink-faint">
            New here?{" "}
            <Link className="font-medium text-accent" href="/signup">
              Create an account
            </Link>
          </p>
        </form>

        <div className="mt-5 border-t border-accent-muted/40 pt-4 text-center">
          <Link href="/welcome" className="text-xs font-medium text-ink-muted hover:text-ink">
            Back to welcome
          </Link>
        </div>
      </div>
    </div>
  );
}

