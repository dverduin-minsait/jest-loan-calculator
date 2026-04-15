"use client";

import Link from "next/link";
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

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${loan.name}"?`)) return;
    await fetch(`/api/loans/${loan.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
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
          onClick={handleDelete}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
