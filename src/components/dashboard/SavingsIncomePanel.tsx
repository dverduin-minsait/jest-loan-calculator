"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SavingsIncomePanelProps {
  userId: string;
  initialSavings: number;
  initialIncome: number;
  initialInflationRate: number;
}

export function SavingsIncomePanel({
  userId,
  initialSavings,
  initialIncome,
  initialInflationRate,
}: SavingsIncomePanelProps) {
  const router = useRouter();
  const [savings, setSavings] = useState(initialSavings.toString());
  const [income, setIncome] = useState(initialIncome.toString());
  const [inflationRate, setInflationRate] = useState(initialInflationRate.toString());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        savings: Number(savings),
        income: Number(income),
        inflationRate: Number(inflationRate),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save. Please try again.");
      return;
    }

    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Financial Overview
      </h2>
      <form onSubmit={handleSave} className="flex flex-wrap gap-4 items-end">
        <div>
          <label
            htmlFor="savings"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Savings (€)
          </label>
          <input
            id="savings"
            type="number"
            min="0"
            step="0.01"
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
          />
        </div>

        <div>
          <label
            htmlFor="income"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Monthly income (€)
          </label>
          <input
            id="income"
            type="number"
            min="0"
            step="0.01"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
          />
        </div>

        <div>
          <label
            htmlFor="inflation-rate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expected inflation (%/yr)
          </label>
          <input
            id="inflation-rate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={inflationRate}
            onChange={(e) => setInflationRate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            placeholder="0"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
