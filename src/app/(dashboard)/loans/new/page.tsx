import { LoanForm } from "@/components/loans/LoanForm";

export default function NewLoanPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">New Loan</h1>
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <LoanForm />
      </div>
    </div>
  );
}
