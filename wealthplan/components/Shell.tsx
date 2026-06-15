"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  PieChart,
  Target,
  Home,
  Shield,
  LineChart,
  Landmark,
  FlaskConical,
  Database,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { useFinance } from "@/hooks/useFinanceData";

const ICONS = {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  PieChart,
  Target,
  Home,
  Shield,
  LineChart,
  Landmark,
  FlaskConical,
  Database,
} as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, updateData } = useFinance();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDark = () => updateData({ darkMode: !data.darkMode });

  const nav = (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            W
          </div>
          <span className="font-semibold text-foreground">WealthPlan</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="rounded-lg p-2 text-muted hover:bg-surface-elevated"
            aria-label="Toggle dark mode"
          >
            {data.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-muted hover:bg-surface-elevated"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 top-[57px] z-30 bg-surface lg:hidden">{nav}</div>
      )}

      <div className="mx-auto flex max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
          <div className="flex items-center justify-between border-b border-border px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                W
              </div>
              <div>
                <p className="font-semibold text-foreground">WealthPlan</p>
                <p className="text-xs text-muted">Personal Finance</p>
              </div>
            </div>
            <button
              onClick={toggleDark}
              className="rounded-lg p-2 text-muted hover:bg-surface-elevated"
              aria-label="Toggle dark mode"
            >
              {data.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{nav}</div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
