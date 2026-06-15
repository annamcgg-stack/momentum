"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FinanceData } from "@/lib/types";
import {
  loadFinanceData,
  saveFinanceData,
  resetFinanceData,
  createNetWorthSnapshot,
} from "@/lib/storage";
import { getNetWorth, getTotalAssets, getTotalLiabilities } from "@/lib/calculations/net-worth";

type FinanceContextValue = {
  data: FinanceData;
  updateData: (patch: Partial<FinanceData>) => void;
  replaceData: (data: FinanceData) => void;
  resetData: () => void;
  loaded: boolean;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(() => loadFinanceData());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadFinanceData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveFinanceData(data);
  }, [data, loaded]);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.toggle("dark", data.darkMode);
  }, [data.darkMode, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const netWorth = getNetWorth(data.assets, data.liabilities);
    const monthKey = new Date().toISOString().slice(0, 7);
    const existing = data.netWorthSnapshots.find((s) => s.date.startsWith(monthKey));
    if (existing && Math.abs(existing.netWorth - netWorth) <= 100) return;

    const snapshot = createNetWorthSnapshot(
      netWorth,
      getTotalAssets(data.assets),
      getTotalLiabilities(data.liabilities)
    );
    setData((prev) => {
      const filtered = prev.netWorthSnapshots.filter((s) => !s.date.startsWith(monthKey));
      return { ...prev, netWorthSnapshots: [...filtered, snapshot] };
    });
  }, [data.assets, data.liabilities, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateData = useCallback((patch: Partial<FinanceData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const replaceData = useCallback((newData: FinanceData) => {
    setData(newData);
  }, []);

  const handleReset = useCallback(() => {
    setData(resetFinanceData());
  }, []);

  const value = useMemo(
    () => ({
      data,
      updateData,
      replaceData,
      resetData: handleReset,
      loaded,
    }),
    [data, updateData, replaceData, handleReset, loaded]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
