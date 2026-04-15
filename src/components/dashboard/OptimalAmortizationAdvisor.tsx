"use client";

import { useState } from "react";
import { findOptimalAmortization, type LoanData } from "@/lib/loan-calculations";

interface OptimalAmortizationAdvisorProps {
  loans: LoanData[];
}

function fmt(n: number) {
  return n.toLocaleString("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function OptimalAmortizationAdvisor({
  loans,
}: OptimalAmortizationAdvisorProps) {
  const [extraAmount, setExtraAmount] = useState("");
  const [atMonth, setAtMonth] = useState("1");
  const [result, setResult] = useState<ReturnType<
    typeof findOptimalAmortization
  > | null>(null);

  if (loans.length === 0) return null;

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(extraAmount);
    const month = Number(atMonth);
    if (amount <= 0 || month < 1) return;
    setResult(findOptimalAmortization(loans, amount, month));
  }

  function handleReset() {
    setResult(null);
    setExtraAmount("");
    setAtMonth("1");
  }

  const maxMonth = Math.max(...loans.map((l) => l.months));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Optimal Amortization Advisor
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Find out which loan benefits most from an extra payment (avalanche
            method).
          </p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label
            htmlFor="adv-amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Extra payment (€)
          </label>
          <input
            id="adv-amount"
            type="number"
            min="1"
            step="0.01"
            value={extraAmount}
            onChange={(e) => setExtraAmount(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            placeholder="5000"
          />
        </div>

        <div>
          <label
            htmlFor="adv-month"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            At month
          </label>
          <input
            id="adv-month"
            type="number"
            min="1"
            max={maxMonth}
            value={atMonth}
            onChange={(e) => setAtMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          />
        </div>

        <button
          type="submit"
          className="py-2 px-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Find optimal loan
        </button>
        {result && (
          <button
            type="button"
            onClick={handleReset}
            className="py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        )}
      </form>

      {result && (
        <div className="space-y-4">
          {/* Warning if atMonth is beyond some loans' term */}
          {result.warning && (
            <div role="alert" className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              ⚠️ {result.warning}
            </div>
          )}

          {/* Winner banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-semibold text-emerald-900 text-base">
                Amortize{" "}
                <span className="underline">{result.bestLoanName}</span> first
              </p>
              <p className="text-emerald-700 text-sm mt-0.5">
                Applying {fmt(Number(extraAmount))} at month {atMonth} here
                saves you{" "}
                <strong>
                  {fmt(result.ranking[0].interestSaved)} in interest
                </strong>{" "}
                and{" "}
                <strong>
                  {result.ranking[0].monthsSaved} month
                  {result.ranking[0].monthsSaved !== 1 ? "s" : ""}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Rankings table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 text-gray-500 font-medium pr-4">#</th>
                  <th className="text-left pb-2 text-gray-500 font-medium pr-4">
                    Loan
                  </th>
                  <th className="text-right pb-2 text-gray-500 font-medium pr-4">
                    Rate
                  </th>
                  <th className="text-right pb-2 text-gray-500 font-medium pr-4">
                    Balance
                  </th>
                  <th className="text-right pb-2 text-gray-500 font-medium pr-4">
                    Interest saved
                  </th>
                  <th className="text-right pb-2 text-gray-500 font-medium">
                    Months saved
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranking.map((row, i) => (
                  <tr
                    key={row.loanId}
                    className={`border-b border-gray-100 ${
                      i === 0 ? "bg-emerald-50 font-medium" : ""
                    }`}
                  >
                    <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-4 text-gray-900 flex items-center gap-1">
                      {i === 0 && <span className="text-emerald-500">★</span>}
                      {row.loanName}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {row.annualRate}%
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {fmt(row.currentBalance)}
                    </td>
                    <td
                      className={`py-2 pr-4 text-right ${
                        row.interestSaved > 0
                          ? "text-emerald-700 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {row.interestSaved > 0
                        ? `+${fmt(row.interestSaved)}`
                        : fmt(row.interestSaved)}
                    </td>
                    <td
                      className={`py-2 text-right ${
                        row.monthsSaved > 0
                          ? "text-emerald-700 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {row.monthsSaved > 0 ? `−${row.monthsSaved}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400">
            Calculation assumes the extra payment is applied at the start of the
            specified month, with the regular monthly payment continuing as
            scheduled.
          </p>
        </div>
      )}
    </div>
  );
}
