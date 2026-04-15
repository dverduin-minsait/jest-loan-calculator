import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SavingsIncomePanel } from "@/components/dashboard/SavingsIncomePanel";
import { DebtChart } from "@/components/dashboard/DebtChart";
import { AmortizationCalculator } from "@/components/dashboard/AmortizationCalculator";
import { OptimalAmortizationAdvisor } from "@/components/dashboard/OptimalAmortizationAdvisor";
import { LoanList } from "@/components/loans/LoanList";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import Link from "next/link";

export default async function DashboardPage() {
  // Layout already redirects unauthenticated users; auth() here gets the session for DB queries.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, loans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, savings: true, income: true },
    }),
    prisma.loan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const loanData = loans.map((l) => ({
    id: l.id,
    name: l.name,
    amount: l.amount,
    interest: l.interest,
    months: l.months,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          href="/loans/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Loan
        </Link>
      </div>

      <SavingsIncomePanel
        userId={user.id}
        initialSavings={user.savings}
        initialIncome={user.income}
      />

      {loanData.length > 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Debt Overview
            </h2>
            <ErrorBoundary>
              <DebtChart loans={loanData} />
            </ErrorBoundary>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Amortization Calculator
            </h2>
            <ErrorBoundary>
              <AmortizationCalculator loans={loanData} />
            </ErrorBoundary>
          </div>

          <ErrorBoundary>
            <OptimalAmortizationAdvisor loans={loanData} />
          </ErrorBoundary>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500 mb-4">No loans yet.</p>
          <Link
            href="/loans/new"
            className="text-blue-600 hover:underline text-sm"
          >
            Add your first loan
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Your Loans</h2>
          <Link href="/loans" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <LoanList loans={loans} />
      </div>
    </div>
  );
}
