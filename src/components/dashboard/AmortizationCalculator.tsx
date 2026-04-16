"use client";

import { useState } from "react";
import { DebtChart } from "./DebtChart";
import {
  applyExtraAmortization,
  generateAmortizationSchedule,
  type LoanData,
  type ExtraPayment,
} from "@/lib/loan-calculations";

interface AmortizationCalculatorProps {
  loans: LoanData[];
}

function exportCsv(schedule: ReturnType<typeof generateAmortizationSchedule>, loanName: string) {
  const header = "Month,Payment,Principal,Interest,Balance";
  const rows = schedule.map((r) =>
    `${r.month},${r.payment.toFixed(2)},${r.principalPaid.toFixed(2)},${r.interestPaid.toFixed(2)},${r.balance.toFixed(2)}`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${loanName.replace(/[^a-z0-9]/gi, "_")}_amortization.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AmortizationCalculator({ loans }: AmortizationCalculatorProps) {
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id ?? "");
  const [month, setMonth] = useState("12");
  const [extraAmount, setExtraAmount] = useState("");
  const [extras, setExtras] =
    useState<Record<string, ExtraPayment> | undefined>(undefined);
  const [warning, setWarning] = useState<string | null>(null);

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);
  const maxMonth = selectedLoan?.months ?? 1;

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLoan) return;

    const parsedMonth = Number(month);
    if (parsedMonth > selectedLoan.months) {
      setWarning(
        `Month ${parsedMonth} is beyond "${selectedLoan.name}"'s term of ${selectedLoan.months} months. The extra payment cannot be applied — choose a month within the loan's term.`
      );
      setExtras(undefined);
      return;
    }
    setWarning(null);

    const extra: ExtraPayment = {
      month: parsedMonth,
      amount: Number(extraAmount),
    };

    setExtras({ [selectedLoanId]: extra });
  }

  const originalSchedule = selectedLoan
    ? generateAmortizationSchedule(selectedLoan)
    : [];

  const extraPayment = extras?.[selectedLoanId];
  const modifiedSchedule =
    selectedLoan && extraPayment
      ? applyExtraAmortization(selectedLoan, extraPayment)
      : null;

  const originalEnd = originalSchedule[originalSchedule.length - 1]?.month ?? 0;
  const modifiedEnd = modifiedSchedule
    ? modifiedSchedule[modifiedSchedule.length - 1]?.month ?? 0
    : null;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCalculate}
        className="flex flex-wrap gap-4 items-end"
      >
        <div>
          <label
            htmlFor="calc-loan"
            className="block text-sm font-medium text-label mb-1"
          >
            Loan
          </label>
          <select
            id="calc-loan"
            value={selectedLoanId}
            onChange={(e) => setSelectedLoanId(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loans.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="calc-month"
            className="block text-sm font-medium text-label mb-1"
          >
            At month
          </label>
          <input
            id="calc-month"
            type="number"
            min="1"
            max={maxMonth}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          />
        </div>

        <div>
          <label
            htmlFor="calc-amount"
            className="block text-sm font-medium text-label mb-1"
          >
            Extra payment (€)
          </label>
          <input
            id="calc-amount"
            type="number"
            min="0"
            step="0.01"
            value={extraAmount}
            onChange={(e) => setExtraAmount(e.target.value)}
            required
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            placeholder="5000"
          />
        </div>

        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Calculate
        </button>
        {extras && (
          <button
            type="button"
            onClick={() => { setExtras(undefined); setWarning(null); setExtraAmount(""); }}
            className="py-2 px-4 bg-card border border-input text-label text-sm font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Reset
          </button>
        )}
      </form>

      {warning && (
        <div role="alert" className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {warning}
        </div>
      )}

      {modifiedSchedule && extraPayment && selectedLoan && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-1">
          <p className="font-medium text-blue-900">Calculation result</p>
          <p className="text-blue-700">
            Original payoff:{" "}
            <strong>
              month {originalEnd} (
              {Math.ceil(originalEnd / 12)} yr{originalEnd > 12 ? "s" : ""})
            </strong>
          </p>
          <p className="text-blue-700">
            After €{Number(extraPayment.amount).toLocaleString()} extra at month{" "}
            {extraPayment.month}:{" "}
            <strong>
              month {modifiedEnd} (saves {originalEnd - (modifiedEnd ?? 0)}{" "}
              months)
            </strong>
          </p>
        </div>
      )}

      {selectedLoan && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => exportCsv(originalSchedule, selectedLoan.name)}
            className="py-1.5 px-3 text-sm border border-input rounded-lg text-label hover:bg-muted transition-colors"
          >
            ↓ Export schedule as CSV
          </button>
        </div>
      )}

      <DebtChart loans={loans} extras={extras} />
    </div>
  );
}
