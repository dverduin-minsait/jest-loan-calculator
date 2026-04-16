"use client";

import { useState, useCallback } from "react";

interface Payment {
  id: string;
  amount: number;
  paidAt: string;
  note: string;
  type: string;
}

interface PaymentHistoryProps {
  loanId: string;
  currency?: string;
}

export function PaymentHistory({ loanId, currency = "EUR" }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ amount: "", note: "", type: "regular", paidAt: "" });
  const [error, setError] = useState("");

  function fmt(n: number) {
    return n.toLocaleString("en", { style: "currency", currency, maximumFractionDigits: 2 });
  }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/loans/${loanId}/payments`);
    if (res.ok) setPayments(await res.json());
    setLoading(false);
  }, [loanId]);

  async function handleOpen() {
    setOpen(true);
    await load();
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (isNaN(amount) || amount <= 0) { setError("Amount must be positive."); return; }

    const res = await fetch(`/api/loans/${loanId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        note: form.note,
        type: form.type,
        paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to record payment.");
      return;
    }

    setForm({ amount: "", note: "", type: "regular", paidAt: "" });
    setAdding(false);
    await load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/loans/${loanId}/payments/${id}`, { method: "DELETE" });
    await load();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="text-sm text-blue-600 hover:underline"
      >
        Payments
      </button>
    );
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">Payment history</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAdding((a) => !a)}
            className="text-xs text-blue-600 hover:underline"
          >
            {adding ? "Cancel" : "+ Record payment"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
            aria-label="Close payment history"
          >
            ✕
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleAddPayment} className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 flex-wrap">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              className="w-28 rounded border px-2 py-1 text-xs"
              required
            />
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="rounded border px-2 py-1 text-xs"
            >
              <option value="regular">Regular</option>
              <option value="extra">Extra</option>
            </select>
            <input
              type="date"
              value={form.paidAt}
              onChange={(e) => setForm((p) => ({ ...p, paidAt: e.target.value }))}
              className="rounded border px-2 py-1 text-xs"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              className="flex-1 min-w-0 rounded border px-2 py-1 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-xs text-gray-400">Loading…</p>}

      {payments !== null && payments.length === 0 && (
        <p className="text-xs text-gray-400">No payments recorded yet.</p>
      )}

      {payments !== null && payments.length > 0 && (
        <div className="space-y-1">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 text-xs text-gray-700">
              <span className="font-medium text-gray-900">{fmt(p.amount)}</span>
              <span className={p.type === "extra" ? "text-green-600" : "text-gray-400"}>
                {p.type}
              </span>
              <span className="text-gray-400">
                {new Date(p.paidAt).toLocaleDateString()}
              </span>
              {p.note && <span className="text-gray-500 truncate">{p.note}</span>}
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="ml-auto text-red-400 hover:text-red-600"
                aria-label="Delete payment"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
