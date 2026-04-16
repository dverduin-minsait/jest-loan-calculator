"use client";

import { useState, useMemo } from "react";
import {
  generateAmortizationSchedule,
  calculateMonthlyPayment,
  type LoanData,
} from "@/lib/loan-calculations";
import { formatCurrency } from "@/lib/format";

interface WhatIfComparisonProps {
  loans: LoanData[];
  currency?: string;
}

export function WhatIfComparison({ loans, currency = "EUR" }: WhatIfComparisonProps) {
  const [selectedId, setSelectedId] = useState(loans[0]?.id ?? "");
  const [newRate, setNewRate] = useState("");
  const [newMonths, setNewMonths] = useState("");
  const [newAmount, setNewAmount] = useState("");

  function fmt(n: number) {
    return formatCurrency(n, currency);
  }

  const selectedLoan = loans.find((l) => l.id === selectedId);

  const comparison = useMemo(() => {
    if (!selectedLoan) return null;

    const originalSchedule = generateAmortizationSchedule(selectedLoan);
    const originalTotalPaid = originalSchedule.reduce((s, e) => s + e.payment, 0);
    const originalInterest = originalSchedule.reduce((s, e) => s + e.interestPaid, 0);
    const originalMonthly = calculateMonthlyPayment(
      selectedLoan.amount,
      selectedLoan.interest,
      selectedLoan.months
    );

    const hypAmount = newAmount ? Number(newAmount) : selectedLoan.amount;
    const hypRate = newRate ? Number(newRate) : selectedLoan.interest;
    const hypMonths = newMonths ? Number(newMonths) : selectedLoan.months;

    if (
      isNaN(hypAmount) || hypAmount <= 0 ||
      isNaN(hypRate) || hypRate < 0 ||
      isNaN(hypMonths) || hypMonths < 1 || !Number.isInteger(hypMonths)
    ) return null;

    const hypLoan: LoanData = {
      ...selectedLoan,
      amount: hypAmount,
      interest: hypRate,
      months: hypMonths,
    };

    const hypSchedule = generateAmortizationSchedule(hypLoan);
    const hypTotalPaid = hypSchedule.reduce((s, e) => s + e.payment, 0);
    const hypInterest = hypSchedule.reduce((s, e) => s + e.interestPaid, 0);
    const hypMonthly = calculateMonthlyPayment(hypAmount, hypRate, hypMonths);

    return {
      original: {
        monthly: originalMonthly,
        totalPaid: originalTotalPaid,
        totalInterest: originalInterest,
        months: selectedLoan.months,
        rate: selectedLoan.interest,
        amount: selectedLoan.amount,
      },
      hypothetical: {
        monthly: hypMonthly,
        totalPaid: hypTotalPaid,
        totalInterest: hypInterest,
        months: hypMonths,
        rate: hypRate,
        amount: hypAmount,
      },
      deltaTotalPaid: originalTotalPaid - hypTotalPaid,
      deltaInterest: originalInterest - hypInterest,
      deltaMonthly: originalMonthly - hypMonthly,
    };
  }, [selectedLoan, newRate, newMonths, newAmount]);

  if (loans.length === 0) return null;

  const inputClass =
    "px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

  return (
    <>
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan to refinance
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={inputClass}
            style={{ width: "auto", minWidth: "160px" }}
          >
            {loans.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New rate (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            className={inputClass}
            placeholder={selectedLoan?.interest.toString()}
            style={{ width: "100px" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New term (months)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={newMonths}
            onChange={(e) => setNewMonths(e.target.value)}
            className={inputClass}
            placeholder={selectedLoan?.months.toString()}
            style={{ width: "110px" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New principal
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className={inputClass}
            placeholder={selectedLoan?.amount.toString()}
            style={{ width: "130px" }}
          />
        </div>
      </div>

      {comparison && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-2 text-gray-500 font-medium pr-6" scope="col" />
                <th className="text-right pb-2 text-gray-500 font-medium pr-6" scope="col">
                  Current
                </th>
                <th className="text-right pb-2 text-gray-500 font-medium pr-6" scope="col">
                  Hypothetical
                </th>
                <th className="text-right pb-2 text-gray-500 font-medium" scope="col">
                  Savings
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Monthly payment",
                  orig: fmt(comparison.original.monthly),
                  hyp: fmt(comparison.hypothetical.monthly),
                  delta: comparison.deltaMonthly,
                },
                {
                  label: "Total paid",
                  orig: fmt(comparison.original.totalPaid),
                  hyp: fmt(comparison.hypothetical.totalPaid),
                  delta: comparison.deltaTotalPaid,
                },
                {
                  label: "Total interest",
                  orig: fmt(comparison.original.totalInterest),
                  hyp: fmt(comparison.hypothetical.totalInterest),
                  delta: comparison.deltaInterest,
                },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-100">
                  <td className="py-2 pr-6 text-gray-700">{row.label}</td>
                  <td className="py-2 pr-6 text-right text-gray-900">{row.orig}</td>
                  <td className="py-2 pr-6 text-right text-blue-700 font-medium">{row.hyp}</td>
                  <td className={`py-2 text-right font-medium ${row.delta > 0 ? "text-green-600" : row.delta < 0 ? "text-red-600" : "text-gray-400"}`}>
                    {row.delta > 0
                      ? `save ${fmt(row.delta)}`
                      : row.delta < 0
                      ? `+${fmt(Math.abs(row.delta))}`
                      : "—"}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-6 text-gray-700">Term</td>
                <td className="py-2 pr-6 text-right text-gray-900">{comparison.original.months} mo</td>
                <td className="py-2 pr-6 text-right text-blue-700 font-medium">{comparison.hypothetical.months} mo</td>
                <td className={`py-2 text-right font-medium ${comparison.original.months - comparison.hypothetical.months > 0 ? "text-green-600" : comparison.original.months - comparison.hypothetical.months < 0 ? "text-red-600" : "text-gray-400"}`}>
                  {comparison.original.months - comparison.hypothetical.months > 0
                    ? `${comparison.original.months - comparison.hypothetical.months} mo sooner`
                    : comparison.original.months - comparison.hypothetical.months < 0
                    ? `${comparison.hypothetical.months - comparison.original.months} mo longer`
                    : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
