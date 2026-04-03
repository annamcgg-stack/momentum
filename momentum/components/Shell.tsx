"use client";

/**
 * App chrome: top bar + bottom navigation (mobile-first).
 * On md+, primary nav moves to the header. Add auth/payment entry points later near the brand mark.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRAND } from "@/lib/theme";
import { useEffect, type ReactNode } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { LogoutButton } from "@/components/LogoutButton";
import { ReminderCoordinator } from "@/components/ReminderCoordinator";

const nav = [
  { href: "/", label: "Today" },
  { href: "/progress", label: "Progress" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Reminders" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const onboardingComplete = Boolean(user?.user_metadata?.onboarding_complete);
  const isSetupPage = pathname?.startsWith("/setup");
  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/welcome");
  const hideAppChrome = isAuthPage || isSetupPage;

  useEffect(() => {
    if (loading || !user) return;

    if (!onboardingComplete && !isSetupPage) {
      router.replace("/setup");
      return;
    }

    if (onboardingComplete && isSetupPage) {
      router.replace("/");
    }
  }, [loading, user, onboardingComplete, isSetupPage, router]);

  return (
    <div className="min-h-dvh bg-canvas pb-[5.5rem] md:pb-10">
      <header className="sticky top-0 z-30 border-b border-accent-muted/40 bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="group min-w-0">
            <p className="font-display text-lg font-semibold tracking-tight text-ink">
              {BRAND.name}
            </p>
            <p className="truncate text-xs text-ink-faint transition-colors group-hover:text-ink-muted">
              {BRAND.tagline}
            </p>
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex gap-1 rounded-2xl border border-accent-muted/50 bg-white/60 p-1 shadow-soft">
              {nav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-canvas-subtle text-ink"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {!hideAppChrome ? (
            <div className="hidden md:block">
              {user ? <LogoutButton /> : null}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-4 md:pt-8">{children}</main>

      {!hideAppChrome && user ? <ReminderCoordinator /> : null}

      {!hideAppChrome ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-accent-muted/50 bg-canvas/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg md:hidden"
          aria-label="Main mobile"
        >
          <ul className="mx-auto flex max-w-lg justify-around">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href} className="min-w-0 flex-1">
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center rounded-xl px-1 py-2 text-[11px] font-medium leading-tight transition-colors sm:text-xs ${
                      active ? "bg-canvas-subtle text-ink" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
