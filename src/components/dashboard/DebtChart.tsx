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

export function DebtChart({ loans, extras }: DebtChartProps) {
  const data = generateChartData(loans, extras);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
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
    { key: "total", label: isMobile ? "Total" : "Total balance remaining", color: "#1f2937", dashed: true },
    { key: "totalPaid", label: isMobile ? "Total paid" : "Total paid (all loans, cumulative)", color: "#6b7280", dashed: true },
    ...(hasInflation
      ? [{ key: "totalReal", label: isMobile ? "Real debt" : "Total real debt (inflation-adjusted)", color: "#a78bfa", dashed: true }]
      : []),
  ], [loans, hasInflation, isMobile]);

  if (data.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
          <Tooltip
            formatter={(value) => [typeof value === "number" ? formatCurrency(value) : String(value ?? ""), ""]}
            labelFormatter={(label) => `Month ${label}`}
            wrapperStyle={{ fontSize: 12, maxWidth: "calc(100vw - 32px)" }}
          />

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
            stroke="#1f2937"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="totalPaid"
            name="Total paid (all loans, cumulative)"
            stroke="#6b7280"
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
