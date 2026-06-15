"use client";

import { useMemo } from "react";
import { useFinance } from "@/hooks/useFinanceData";
import { getDashboardSummary } from "@/lib/calculations/cashflow";
import { sortGoalsByProgress, getGoalProgress, getGoalRemaining } from "@/lib/calculations/goals";
import { getExpenseBreakdown } from "@/lib/calculations/expenses";
import { getBucketAllocations } from "@/lib/calculations/allocation";
import { getNetWorthTrend, getAssetAllocation, ASSET_TYPE_LABELS } from "@/lib/calculations/net-worth";
import { calculateInvestmentProjection, getScenarioReturns } from "@/lib/calculations/investment-projection";
import { formatCurrency, formatPercent } from "@/lib/format";
import { StatCard, ProgressBar, SectionHeader } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import {
  AllocationPieChart,
  CategoryBarChart,
  TrendLineChart,
  IncomeExpenseChart,
  MultiLineChart,
} from "@/components/charts/FinanceCharts";
export default function DashboardPage() {
  const { data } = useFinance();
  const country = data.income.country;
  const fmt = (v: number) => formatCurrency(v, country);

  const summary = useMemo(() => getDashboardSummary(data), [data]);
  const goals = useMemo(() => sortGoalsByProgress(data.goals).slice(0, 5), [data.goals]);
  const expenseBreakdown = useMemo(() => getExpenseBreakdown(data.expenses), [data.expenses]);
  const allocations = useMemo(
    () => getBucketAllocations(data.allocationBuckets, summary.cashflow.monthlySurplus),
    [data.allocationBuckets, summary.cashflow.monthlySurplus]
  );
  const netWorthTrend = useMemo(() => getNetWorthTrend(data.netWorthSnapshots), [data.netWorthSnapshots]);
  const assetAllocation = useMemo(() => getAssetAllocation(data.assets), [data.assets]);

  const returns = getScenarioReturns(data.investmentProjection.annualReturn);
  const projectionData = useMemo(() => {
    const conservative = calculateInvestmentProjection({ ...data.investmentProjection, annualReturn: returns.conservative });
    const base = calculateInvestmentProjection(data.investmentProjection);
    const optimistic = calculateInvestmentProjection({ ...data.investmentProjection, annualReturn: returns.optimistic });
    return base.points.map((p, i) => ({
      label: `Y${p.year}`,
      conservative: conservative.points[i]?.value ?? 0,
      base: p.value,
      optimistic: optimistic.points[i]?.value ?? 0,
    }));
  }, [data.investmentProjection, returns]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        description="Your complete financial overview at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net Worth" value={fmt(summary.netWorth)} trend="up" />
        <StatCard label="Annual Income" value={fmt(summary.annualIncome)} subtext="After tax" />
        <StatCard label="Annual Expenses" value={fmt(summary.annualExpenses)} />
        <StatCard label="Annual Savings" value={fmt(summary.annualSavings)} trend="up" />
        <StatCard label="Annual Investments" value={fmt(summary.annualInvestments)} />
        <StatCard label="Savings Rate" value={formatPercent(summary.savingsRate)} />
        <StatCard
          label="Emergency Fund"
          value={`${summary.emergencyCoverage.toFixed(1)} mo`}
          subtext="Coverage"
        />
        <StatCard
          label="House Deposit"
          value={formatPercent(summary.houseDepositProgress)}
          subtext="Progress"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Income vs Expenses</h2>
          <IncomeExpenseChart
            income={summary.annualIncome}
            expenses={summary.annualExpenses}
            formatter={fmt}
          />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Allocation</h2>
          <AllocationPieChart
            data={allocations.map((a) => ({ name: a.name, value: a.monthlyAmount }))}
            formatter={fmt}
          />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Expense Categories</h2>
          {expenseBreakdown.length > 0 ? (
            <CategoryBarChart
              data={expenseBreakdown.map((e) => ({ label: e.label, value: e.monthly }))}
              formatter={fmt}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted">Add fixed expenses to see breakdown.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Net Worth Growth</h2>
          {netWorthTrend.length > 0 ? (
            <TrendLineChart data={netWorthTrend} dataKey="netWorth" formatter={fmt} />
          ) : (
            <p className="py-8 text-center text-sm text-muted">Net worth snapshots will appear over time.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Investment Projection</h2>
          <MultiLineChart
            data={projectionData}
            lines={[
              { key: "conservative", color: "#F59E0B", name: "Conservative" },
              { key: "base", color: "#3B82F6", name: "Base" },
              { key: "optimistic", color: "#10B981", name: "Optimistic" },
            ]}
            formatter={fmt}
          />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Asset Allocation</h2>
          <AllocationPieChart
            data={assetAllocation.map((a) => ({
              name: ASSET_TYPE_LABELS[a.type] ?? a.type,
              value: a.value,
            }))}
            formatter={fmt}
          />
        </Card>
      </div>

      {goals.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Goal Progress</h2>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{goal.name}</span>
                  <span className="text-muted">
                    {fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}
                  </span>
                </div>
                <ProgressBar value={getGoalProgress(goal)} color="bg-primary" />
                <p className="mt-1 text-xs text-muted">{fmt(getGoalRemaining(goal))} remaining</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
