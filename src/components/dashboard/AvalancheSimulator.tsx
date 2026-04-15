"use client";

import { useState } from "react";
import { simulateMonthlyAvalanche, type LoanData } from "@/lib/loan-calculations";

interface AvalancheSimulatorProps {
  loans: LoanData[];
}

function fmt(n: number) {
  return n.toLocaleString("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function AvalancheSimulator({ loans }: AvalancheSimulatorProps) {
  const [monthlyExtra, setMonthlyExtra] = useState("");
  const [result, setResult] = useState<ReturnType<
    typeof simulateMonthlyAvalanche
  > | null>(null);

  if (loans.length === 0) return null;

  function handleSimulate(e: React.FormEvent) {
    e.preventDefault();
    const extra = parseFloat(monthlyExtra);
    if (isNaN(extra) || extra < 0) return;
    setResult(simulateMonthlyAvalanche(loans, extra));
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-gray-800">
        Monthly Avalanche Simulator
      </h2>
      <p className="mb-4 text-sm text-gray-500">
        How much total interest could you save by putting an extra fixed amount
        toward your highest-rate debt each month?
      </p>

      <form onSubmit={handleSimulate} className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="monthly-extra"
            className="text-sm font-medium text-gray-700"
          >
            Extra per month (€)
          </label>
          <input
            id="monthly-extra"
            type="number"
            min="0"
            step="10"
            value={monthlyExtra}
            onChange={(e) => setMonthlyExtra(e.target.value)}
            className="w-36 rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. 200"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Simulate
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xs text-gray-500">Baseline interest</div>
              <div className="mt-1 text-base font-semibold text-gray-800">
                {fmt(result.totalInterestBaseline)}
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xs text-gray-500">Interest with extra</div>
              <div className="mt-1 text-base font-semibold text-blue-600">
                {fmt(result.totalInterestWithExtra)}
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-xs text-gray-500">Interest saved</div>
              <div className="mt-1 text-base font-semibold text-green-700">
                {fmt(result.interestSaved)}
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-xs text-gray-500">Months saved</div>
              <div className="mt-1 text-base font-semibold text-green-700">
                {result.monthsSaved}
              </div>
            </div>
          </div>

          {result.payoffOrder.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">
                Payoff order (avalanche)
              </h3>
              <ol className="space-y-1">
                {result.payoffOrder.map((p, i) => (
                  <li key={p.loanId} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {i + 1}
                    </span>
                    <span className="font-medium">{p.loanName}</span>
                    <span className="text-gray-500">
                      — paid off at month {p.month}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
