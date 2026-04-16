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

  const hasInflation = loans.some((l) => (l.inflationRate ?? 0) > 0);

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
    <>
      <form onSubmit={handleCalculate} className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label
            htmlFor="adv-amount"
            className="block text-sm font-medium text-label mb-1"
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
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            placeholder="5000"
          />
        </div>

        <div>
          <label
            htmlFor="adv-month"
            className="block text-sm font-medium text-label mb-1"
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
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
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
            className="py-2 px-4 bg-card border border-input text-label text-sm font-medium rounded-lg hover:bg-muted transition-colors"
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
                </strong>
                {hasInflation && (
                  <>
                    {" "}(<strong>{fmt(result.ranking[0].realInterestSaved)} real</strong>)
                  </>
                )}
                {" "}and{" "}
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
                <tr className="border-b border-border">
                  <th className="text-left pb-2 text-muted-foreground font-medium pr-4" scope="col">#</th>
                  <th className="text-left pb-2 text-muted-foreground font-medium pr-4" scope="col">
                    Loan
                  </th>
                  <th className="text-right pb-2 text-muted-foreground font-medium pr-4" scope="col">
                    Rate
                  </th>
                  <th className="text-right pb-2 text-muted-foreground font-medium pr-4" scope="col">
                    Balance
                  </th>
                  <th className="text-right pb-2 text-muted-foreground font-medium pr-4" scope="col">
                    Interest saved
                  </th>
                  {hasInflation && (
                    <th className="text-right pb-2 text-muted-foreground font-medium pr-4" scope="col">
                      Real saved
                    </th>
                  )}
                  <th className="text-right pb-2 text-muted-foreground font-medium" scope="col">
                    Months saved
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranking.map((row, i) => (
                  <tr
                    key={row.loanId}
                    className={`border-b border-divider ${
                      i === 0 ? "bg-emerald-50 font-medium" : ""
                    }`}
                  >
                    <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-4 text-foreground flex items-center gap-1">
                      {i === 0 && <span className="text-emerald-500">★</span>}
                      {row.loanName}
                    </td>
                    <td className="py-2 pr-4 text-right text-label">
                      {row.annualRate}%
                    </td>
                    <td className="py-2 pr-4 text-right text-label">
                      {fmt(row.currentBalance)}
                    </td>
                    <td
                      className={`py-2 pr-4 text-right ${
                        row.interestSaved > 0
                          ? "text-emerald-700 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {row.interestSaved > 0
                        ? `+${fmt(row.interestSaved)}`
                        : fmt(row.interestSaved)}
                    </td>
                    {hasInflation && (
                      <td
                        className={`py-2 pr-4 text-right ${
                          row.realInterestSaved > 0
                            ? "text-violet-700 font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {row.realInterestSaved > 0
                          ? `+${fmt(row.realInterestSaved)}`
                          : fmt(row.realInterestSaved)}
                      </td>
                    )}
                    <td
                      className={`py-2 text-right ${
                        row.monthsSaved > 0
                          ? "text-emerald-700 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {row.monthsSaved > 0 ? `−${row.monthsSaved}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Calculation assumes the extra payment is applied at the start of the
            specified month, with the regular monthly payment continuing as
            scheduled.{hasInflation && " \u201cReal saved\u201d discounts each payment by your expected inflation rate to show savings in today\u2019s purchasing power."}
          </p>
        </div>
      )}
    </>
  );
}
