"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/browserClient";
import { BRAND } from "@/lib/theme";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase)
        throw new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // If email confirmation is disabled, user can continue setup immediately.
      if (data.session && data.user) {
        router.replace("/setup");
      } else {
        setMessage("Check your email to confirm your account, then log in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
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
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Create account</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Start your private wellness tracker in under a minute.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-2xl border border-accent-muted/60 bg-canvas-subtle/60 p-1 text-xs">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-center font-medium text-ink-muted hover:text-ink"
          >
            Log in
          </Link>
          <span className="rounded-xl bg-white px-3 py-2 text-center font-semibold text-ink shadow-soft">
            Sign up
          </span>
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
              placeholder="At least 8 characters"
            />
          </label>

          {error ? <p className="text-sm text-rose">{error}</p> : null}
          {message ? <p className="text-sm text-sage">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-xs text-ink-faint">
            Already have an account?{" "}
            <Link className="font-medium text-accent" href="/login">
              Log in
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

