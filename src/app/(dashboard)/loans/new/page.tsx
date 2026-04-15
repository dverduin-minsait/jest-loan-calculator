import { LoanForm } from "@/components/loans/LoanForm";

export default function NewLoanPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Loan</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <LoanForm />
      </div>
    </div>
  );
}
