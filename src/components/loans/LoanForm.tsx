"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Loan {
  id: string;
  name: string;
  amount: number;
  interest: number;
  partialAmortRate: number;
  totalAmortRate: number;
  months: number;
}

interface LoanFormProps {
  loan?: Loan;
}

export function LoanForm({ loan }: LoanFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState({
    name: loan?.name ?? "",
    amount: loan?.amount?.toString() ?? "",
    interest: loan?.interest?.toString() ?? "",
    partialAmortRate: loan?.partialAmortRate?.toString() ?? "0",
    totalAmortRate: loan?.totalAmortRate?.toString() ?? "0",
    months: loan?.months?.toString() ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amount = Number(fields.amount);
    const interest = Number(fields.interest);
    const months = Number(fields.months);

    if (isNaN(amount) || amount < 0) {
      setError("Principal must be a non-negative number.");
      return;
    }
    if (isNaN(interest) || interest < 0) {
      setError("Interest rate must be a non-negative number.");
      return;
    }
    if (!Number.isInteger(months) || months < 1) {
      setError("Term must be a positive whole number of months.");
      return;
    }

    setLoading(true);

    const payload = {
      name: fields.name,
      amount,
      interest,
      partialAmortRate: Number(fields.partialAmortRate),
      totalAmortRate: Number(fields.totalAmortRate),
      months,
    };

    const url = loan ? `/api/loans/${loan.id}` : "/api/loans";
    const method = loan ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save loan");
      return;
    }

    router.push("/loans");
    router.refresh();
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Loan name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          required
          className={inputClass}
          placeholder="e.g. Car loan"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className={labelClass}>
            Principal (€)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={fields.amount}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="10000"
          />
        </div>

        <div>
          <label htmlFor="months" className={labelClass}>
            Term (months)
          </label>
          <input
            id="months"
            name="months"
            type="number"
            step="1"
            value={fields.months}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="60"
          />
        </div>
      </div>

      <div>
        <label htmlFor="interest" className={labelClass}>
          Annual interest rate (%)
        </label>
        <input
          id="interest"
          name="interest"
          type="number"
          step="0.01"
            value={fields.interest}
            onChange={handleChange}
          required
          className={inputClass}
          placeholder="4.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="partialAmortRate" className={labelClass}>
            Partial amort. rate (%)
          </label>
          <input
            id="partialAmortRate"
            name="partialAmortRate"
            type="number"
            min="0"
            step="0.01"
            value={fields.partialAmortRate}
            onChange={handleChange}
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="totalAmortRate" className={labelClass}>
            Total amort. rate (%)
          </label>
          <input
            id="totalAmortRate"
            name="totalAmortRate"
            type="number"
            min="0"
            step="0.01"
            value={fields.totalAmortRate}
            onChange={handleChange}
            className={inputClass}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : loan ? "Update loan" : "Create loan"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
