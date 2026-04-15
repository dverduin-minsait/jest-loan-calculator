"use client";

import {
  generateAmortizationSchedule,
  type LoanData,
} from "@/lib/loan-calculations";

interface LoanSummaryCardProps {
  loans: LoanData[];
}

function fmt(n: number) {
  return n.toLocaleString("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function LoanSummaryCard({ loans }: LoanSummaryCardProps) {
  if (loans.length === 0) return null;

  const totals = loans.reduce(
    (acc, loan) => {
      const schedule = generateAmortizationSchedule(loan);
      const totalPaid = schedule.reduce((s, e) => s + e.payment, 0);
      const totalInterest = schedule.reduce((s, e) => s + e.interestPaid, 0);
      return {
        principal: acc.principal + loan.amount,
        totalPaid: acc.totalPaid + totalPaid,
        totalInterest: acc.totalInterest + totalInterest,
      };
    },
    { principal: 0, totalPaid: 0, totalInterest: 0 }
  );

  const interestRatio =
    totals.principal > 0 ? (totals.totalInterest / totals.principal) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Loan Cost Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Loans</p>
          <p className="text-xl font-semibold text-gray-900">{loans.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total principal</p>
          <p className="text-xl font-semibold text-gray-900">{fmt(totals.principal)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total you will pay</p>
          <p className="text-xl font-semibold text-gray-900">{fmt(totals.totalPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total interest cost</p>
          <p className="text-xl font-semibold text-red-600">
            {fmt(totals.totalInterest)}
            <span className="text-sm text-red-400 ml-1">({interestRatio.toFixed(1)}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
