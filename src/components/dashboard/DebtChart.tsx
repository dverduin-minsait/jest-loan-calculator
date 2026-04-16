"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateChartData, type LoanData, type ExtraPayment } from "@/lib/loan-calculations";
import { ChartLegend, type LegendItem } from "@/components/ui/ChartLegend";

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

/** Compact format for narrow Y-axes: €10k, €1.2M */
function formatCurrencyShort(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${Math.round(value)}`;
}

/** Custom tooltip that inherits CSS variable colours for dark mode support */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs max-w-[calc(100vw-32px)]">
      <p className="font-medium text-foreground mb-1">Month {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function DebtChart({ loans, extras }: DebtChartProps) {
  const data = generateChartData(loans, extras);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const maxMonths = data.length;
  const useYears = maxMonths > 24;
  const hasInflation = data.some((d) => "totalReal" in d);

  const legendItems = useMemo<LegendItem[]>(() => [
    ...loans.flatMap((loan, i) => [
      {
        key: `${loan.id}-balance`,
        label: isMobile ? loan.name : `${loan.name} (balance)`,
        color: COLORS[i % COLORS.length],
        dashed: false,
      },
      {
        key: `${loan.id}-paid`,
        label: isMobile ? `${loan.name} paid` : `${loan.name} (cumulative paid)`,
        color: COLORS[i % COLORS.length],
        dashed: true,
      },
    ]),
    { key: "total", label: isMobile ? "Total" : "Total balance remaining", color: "#94a3b8", dashed: true },
    { key: "totalPaid", label: isMobile ? "Total paid" : "Total paid (all loans, cumulative)", color: "#64748b", dashed: true },
    ...(hasInflation
      ? [{ key: "totalReal", label: isMobile ? "Real debt" : "Total real debt (inflation-adjusted)", color: "#a78bfa", dashed: true }]
      : []),
  ], [loans, hasInflation, isMobile]);

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-8">
        No loan data to display.
      </p>
    );
  }

  const xTicks = useYears
    ? Array.from({ length: Math.ceil(maxMonths / 12) }, (_, i) => (i + 1) * 12).filter((m) => m <= maxMonths)
    : undefined;

  const chartHeight = isMobile ? 260 : 360;
  const yAxisWidth = isMobile ? 52 : 80;
  const tickFontSize = isMobile ? 10 : 12;
  const margins = isMobile
    ? { top: 5, right: 8, left: 0, bottom: 16 }
    : { top: 5, right: 20, left: 20, bottom: 5 };

  return (
    <div>
      <ResponsiveContainer
        width="100%"
        height={chartHeight}
        aria-label="Debt overview chart showing loan balances and cumulative payments over time"
      >
        <LineChart data={data} margin={margins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            ticks={xTicks}
            tickFormatter={(month) => useYears ? `Y${Math.round(month / 12)}` : `${month}`}
            label={isMobile ? undefined : { value: useYears ? "Year" : "Month", position: "insideBottom", offset: -2 }}
            tick={{ fontSize: tickFontSize }}
          />
          <YAxis
            tickFormatter={isMobile ? formatCurrencyShort : formatCurrency}
            tick={{ fontSize: tickFontSize }}
            width={yAxisWidth}
          />
          <Tooltip content={<ChartTooltip />} />

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

          <Line
            type="monotone"
            dataKey="total"
            name="Total balance remaining"
            stroke="#94a3b8"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="totalPaid"
            name="Total paid (all loans, cumulative)"
            stroke="#64748b"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={false}
          />
          {hasInflation && (
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

      <ChartLegend items={legendItems} />
    </div>
  );
}
