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

export function AmortizationCalculator({ loans }: AmortizationCalculatorProps) {
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id ?? "");
  const [month, setMonth] = useState("12");
  const [extraAmount, setExtraAmount] = useState("");
  const [extras, setExtras] =
    useState<Record<string, ExtraPayment> | undefined>(undefined);

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);
  const maxMonth = selectedLoan?.months ?? 1;

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLoan) return;

    const extra: ExtraPayment = {
      month: Number(month),
      amount: Number(extraAmount),
    };

    setExtras({ [selectedLoanId]: extra });
  }

  function handleReset() {
    setExtras(undefined);
    setExtraAmount("");
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Loan
          </label>
          <select
            id="calc-loan"
            value={selectedLoanId}
            onChange={(e) => setSelectedLoanId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          />
        </div>

        <div>
          <label
            htmlFor="calc-amount"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
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
            onClick={handleReset}
            className="py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        )}
      </form>

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

      <DebtChart loans={loans} extras={extras} />
    </div>
  );
}
