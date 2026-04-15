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

  const hasInflation = loans.some((l) => (l.inflationRate ?? 0) > 0);

  const totals = loans.reduce(
    (acc, loan) => {
      const schedule = generateAmortizationSchedule(loan);
      const totalPaid = schedule.reduce((s, e) => s + e.payment, 0);
      const totalRealPaid = schedule.reduce((s, e) => s + e.realPayment, 0);
      const totalInterest = schedule.reduce((s, e) => s + e.interestPaid, 0);
      return {
        principal: acc.principal + loan.amount,
        totalPaid: acc.totalPaid + totalPaid,
        totalRealPaid: acc.totalRealPaid + totalRealPaid,
        totalInterest: acc.totalInterest + totalInterest,
      };
    },
    { principal: 0, totalPaid: 0, totalRealPaid: 0, totalInterest: 0 }
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
      {hasInflation && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Real total paid <span className="normal-case text-gray-400">(today&apos;s money)</span>
            </p>
            <p className="text-xl font-semibold text-gray-900">{fmt(totals.totalRealPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Inflation benefit</p>
            <p className="text-xl font-semibold text-green-600">
              {fmt(totals.totalPaid - totals.totalRealPaid)}
              <span className="text-sm text-green-400 ml-1">less in real terms</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
