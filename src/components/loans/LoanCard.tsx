"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { calculateLoanProgress } from "@/lib/loan-calculations";
import { PaymentHistory } from "@/components/loans/PaymentHistory";
import type { Loan } from "@/types/loan";

const CATEGORY_LABELS: Record<string, string> = {
  mortgage: "Mortgage",
  car: "Car",
  personal: "Personal",
  student: "Student",
  business: "Business",
  credit_card: "Credit Card",
  other: "Other",
};

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const progress = useMemo(
    () => calculateLoanProgress({ id: loan.id, name: loan.name, amount: loan.amount, interest: loan.interest, months: loan.months, startDate: loan.startDate }),
    [loan]
  );

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
    <div className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors">
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">{loan.name}</p>
          {loan.category && loan.category !== "other" && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {CATEGORY_LABELS[loan.category] ?? loan.category}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
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
        </div>
        {loan.startDate && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
              <span>Progress</span>
              <span>{progress.isComplete ? "Complete" : `${progress.percentComplete}% · month ${progress.currentMonth}/${loan.months}`}</span>
            </div>
            <div className="w-full bg-track rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${progress.isComplete ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(progress.percentComplete, 100)}%` }}
                role="progressbar"
                aria-valuenow={progress.percentComplete}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 ml-4 shrink-0">
        <PaymentHistory loanId={loan.id} />
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
