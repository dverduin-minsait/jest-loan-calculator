"use client";

import {
  generateAmortizationSchedule,
  calculateMonthlyPayment,
  type LoanData,
} from "@/lib/loan-calculations";
import { formatCurrency } from "@/lib/format";
import { LOAN_CATEGORIES } from "@/lib/format";

interface LoanSummaryCardProps {
  loans: LoanData[];
  income?: number;
  currency?: string;
}

export function LoanSummaryCard({ loans, income = 0, currency = "EUR" }: LoanSummaryCardProps) {
  if (loans.length === 0) return null;

  function fmt(n: number) {
    return formatCurrency(n, currency);
  }

  const hasInflation = loans.some((l) => (l.inflationRate ?? 0) > 0);

  const totals = loans.reduce(
    (acc, loan) => {
      const schedule = generateAmortizationSchedule(loan);
      const totalPaid = schedule.reduce((s, e) => s + e.payment, 0);
      const totalRealPaid = schedule.reduce((s, e) => s + e.realPayment, 0);
      const totalInterest = schedule.reduce((s, e) => s + e.interestPaid, 0);
      const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interest, loan.months);
      return {
        principal: acc.principal + loan.amount,
        totalPaid: acc.totalPaid + totalPaid,
        totalRealPaid: acc.totalRealPaid + totalRealPaid,
        totalInterest: acc.totalInterest + totalInterest,
        monthlyPayments: acc.monthlyPayments + monthlyPayment,
      };
    },
    { principal: 0, totalPaid: 0, totalRealPaid: 0, totalInterest: 0, monthlyPayments: 0 }
  );

  const interestRatio =
    totals.principal > 0 ? (totals.totalInterest / totals.principal) * 100 : 0;

  const dtiRatio = income > 0 ? (totals.monthlyPayments / income) * 100 : null;
  const dtiColor =
    dtiRatio === null ? "" :
    dtiRatio < 36 ? "text-green-600" :
    dtiRatio < 50 ? "text-amber-600" :
    "text-red-600";

  const categoryBreakdown = LOAN_CATEGORIES
    .map((cat) => ({
      label: cat.label,
      total: loans
        .filter((l) => (l.category ?? "other") === cat.value)
        .reduce((s, l) => s + l.amount, 0),
    }))
    .filter((c) => c.total > 0);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Loans</p>
          <p className="text-xl font-semibold text-foreground">{loans.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total principal</p>
          <p className="text-xl font-semibold text-foreground">{fmt(totals.principal)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total you will pay</p>
          <p className="text-xl font-semibold text-foreground">{fmt(totals.totalPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total interest cost</p>
          <p className="text-xl font-semibold text-red-600">
            {fmt(totals.totalInterest)}
            <span className="text-sm text-red-400 ml-1">({interestRatio.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {dtiRatio !== null && (
        <div className="mt-4 pt-4 border-t border-divider">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Debt-to-income ratio
            </p>
            <p className={`text-base font-semibold ${dtiColor}`}>
              {dtiRatio.toFixed(1)}%
              <span className="text-xs font-normal text-gray-400 ml-1">
                {dtiRatio < 36 ? "(healthy)" : dtiRatio < 50 ? "(concerning)" : "(high)"}
              </span>
            </p>
          </div>
          <div className="w-full bg-track rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${dtiRatio < 36 ? "bg-green-500" : dtiRatio < 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(dtiRatio, 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(dtiRatio)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`DTI ratio: ${dtiRatio.toFixed(1)}%`}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Monthly payments {fmt(totals.monthlyPayments)} vs income {fmt(income)}
          </p>
        </div>
      )}

      {categoryBreakdown.length > 1 && (
        <div className="mt-4 pt-4 border-t border-divider">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">By category</p>
          <div className="flex flex-wrap gap-3">
            {categoryBreakdown.map((c) => (
              <div key={c.label} className="text-sm">
                <span className="text-muted-foreground">{c.label}: </span>
                <span className="font-medium text-foreground">{fmt(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasInflation && (
        <div className="mt-4 pt-4 border-t border-divider grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Real total paid <span className="normal-case text-gray-400">(today&apos;s money)</span>
            </p>
            <p className="text-xl font-semibold text-foreground">{fmt(totals.totalRealPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Inflation benefit</p>
            <p className="text-xl font-semibold text-green-600">
              {fmt(totals.totalPaid - totals.totalRealPaid)}
              <span className="text-sm text-green-400 ml-1">less in real terms</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
