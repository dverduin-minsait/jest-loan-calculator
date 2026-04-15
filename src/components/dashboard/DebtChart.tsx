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

  if (data.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        No loan data to display.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          label={{ value: "Month", position: "insideBottom", offset: -2 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
          width={80}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), ""]}
          labelFormatter={(label) => `Month ${label}`}
        />
        <Legend verticalAlign="top" />

        {/* Individual loan lines */}
        {loans.map((loan, i) => (
          <Line
            key={loan.id}
            type="monotone"
            dataKey={loan.id}
            name={loan.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}

        {/* Total debt line */}
        <Line
          type="monotone"
          dataKey="total"
          name="Total debt"
          stroke="#1f2937"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
