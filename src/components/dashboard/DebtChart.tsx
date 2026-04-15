"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { generateChartData, type LoanData, type ExtraPayment } from "@/lib/loan-calculations";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

interface DebtChartProps {
  loans: LoanData[];
  extras?: Record<string, ExtraPayment>;
}

function formatCurrency(value: number) {
  return value.toLocaleString("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export function DebtChart({ loans, extras }: DebtChartProps) {
  const data = generateChartData(loans, extras);
  const maxMonths = data.length;
  // Use year labels when the longest loan exceeds 24 months
  const useYears = maxMonths > 24;

  if (data.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        No loan data to display.
      </p>
    );
  }

  // For long loans, only tick every 12 months (yearly)
  const xTicks = useYears
    ? Array.from({ length: Math.ceil(maxMonths / 12) }, (_, i) => (i + 1) * 12).filter((m) => m <= maxMonths)
    : undefined; // let Recharts decide for short loans

  return (
    <ResponsiveContainer width="100%" height={360} aria-label="Debt overview chart showing loan balances and cumulative payments over time">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          ticks={xTicks}
          tickFormatter={(month) => useYears ? `Y${Math.round(month / 12)}` : `${month}`}
          label={{ value: useYears ? "Year" : "Month", position: "insideBottom", offset: -2 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
          width={80}
        />
        <Tooltip
          formatter={(value) => [typeof value === "number" ? formatCurrency(value) : String(value ?? ""), ""]}
          labelFormatter={(label) => `Month ${label}`}
        />
        <Legend verticalAlign="top" />

        {/* Individual loan lines — balance (solid) + cumulative paid (dotted) */}
        {loans.flatMap((loan, i) => [
          <Line
            key={`${loan.id}-balance`}
            type="monotone"
            dataKey={loan.id}
            name={`${loan.name} (balance)`}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />,
          <Line
            key={`${loan.id}-paid`}
            type="monotone"
            dataKey={`${loan.id}_paid`}
            name={`${loan.name} (cumulative paid)`}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            strokeDasharray="5 3"
            strokeOpacity={0.55}
            dot={false}
          />,
        ])}

        {/* Total debt remaining */}
        <Line
          type="monotone"
          dataKey="total"
          name="Total balance remaining"
          stroke="#1f2937"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={false}
        />

        {/* Total cumulative paid — the running sum of all payments across all loans.
            This line climbs upward; where it ends up above the original principal
            shows you exactly how much interest you paid over the life of the loans. */}
        <Line
          type="monotone"
          dataKey="totalPaid"
          name="Total paid (all loans, cumulative)"
          stroke="#6b7280"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={false}
        />
        {/* Real total balance (inflation-adjusted) — only shown when at least one loan
            has an inflation rate > 0. Shows how the real burden of the debt erodes
            faster than the nominal balance due to inflation. */}
        {data.some((d) => "totalReal" in d) && (
          <Line
            type="monotone"
            dataKey="totalReal"
            name="Total real debt (inflation-adjusted)"
            stroke="#a78bfa"
            strokeWidth={1.5}
            strokeDasharray="3 2"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
