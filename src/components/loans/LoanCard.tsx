"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import type { Loan } from "@/types/loan";

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleDelete() {
    const res = await fetch(`/api/loans/${loan.id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: `"${loan.name}" deleted.`, type: "success" });
      router.refresh();
    } else {
      setToast({ message: "Failed to delete loan. Please try again.", type: "error" });
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
      {confirming && (
        <ConfirmDialog
          message={`Delete "${loan.name}"? This cannot be undone.`}
          onConfirm={() => { setConfirming(false); handleDelete(); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="space-y-1">
        <p className="font-medium text-gray-900">{loan.name}</p>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span>
            Amount:{" "}
            <strong>
              {loan.amount.toLocaleString("en", {
                style: "currency",
                currency: "EUR",
              })}
            </strong>
          </span>
          <span>
            Interest: <strong>{loan.interest}%/yr</strong>
          </span>
          <span>
            Term: <strong>{loan.months} months</strong>
          </span>
          {loan.partialAmortRate > 0 && (
            <span>
              Partial amort: <strong>{loan.partialAmortRate}%</strong>
            </span>
          )}
          {loan.totalAmortRate > 0 && (
            <span>
              Total amort: <strong>{loan.totalAmortRate}%</strong>
            </span>
          )}
          {loan.inflationRate > 0 && (
            <span>
              Inflation: <strong>{loan.inflationRate}%/yr</strong>
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 ml-4 shrink-0">
        <Link
          href={`/loans/${loan.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </Link>
        <button
          onClick={() => setConfirming(true)}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
    </>
  );
}
