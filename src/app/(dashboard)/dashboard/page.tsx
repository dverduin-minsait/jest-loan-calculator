import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SavingsIncomePanel } from "@/components/dashboard/SavingsIncomePanel";
import { DebtChart } from "@/components/dashboard/DebtChart";
import { AmortizationCalculator } from "@/components/dashboard/AmortizationCalculator";
import { OptimalAmortizationAdvisor } from "@/components/dashboard/OptimalAmortizationAdvisor";
import { AvalancheSimulator } from "@/components/dashboard/AvalancheSimulator";
import { LoanList } from "@/components/loans/LoanList";
import { LoanSummaryCard } from "@/components/dashboard/LoanSummaryCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import Link from "next/link";

export default async function DashboardPage() {
  // Layout already redirects unauthenticated users; auth() here gets the session for DB queries.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, loans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, savings: true, income: true, inflationRate: true },
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
    inflationRate: user.inflationRate,
    partialAmortRate: l.partialAmortRate,
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

      <CollapsibleSection title="Financial Overview">
        <SavingsIncomePanel
          userId={user.id}
          initialSavings={user.savings}
          initialIncome={user.income}
          initialInflationRate={user.inflationRate}
        />
      </CollapsibleSection>

      {loanData.length > 0 ? (
        <>
          <CollapsibleSection title="Loan Cost Summary">
            <LoanSummaryCard loans={loanData} />
          </CollapsibleSection>

          <CollapsibleSection title="Debt Overview">
            <ErrorBoundary>
              <DebtChart loans={loanData} />
            </ErrorBoundary>
          </CollapsibleSection>

          <CollapsibleSection title="Amortization Calculator">
            <ErrorBoundary>
              <AmortizationCalculator loans={loanData} />
            </ErrorBoundary>
          </CollapsibleSection>

          <CollapsibleSection
            title="Optimal Amortization Advisor"
            subtitle="Find out which loan benefits most from an extra payment (avalanche method)."
          >
            <ErrorBoundary>
              <OptimalAmortizationAdvisor loans={loanData} />
            </ErrorBoundary>
          </CollapsibleSection>

          <CollapsibleSection
            title="Monthly Avalanche Simulator"
            subtitle="How much total interest could you save by putting an extra fixed amount toward your highest-rate debt each month?"
          >
            <ErrorBoundary>
              <AvalancheSimulator loans={loanData} />
            </ErrorBoundary>
          </CollapsibleSection>
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

      <CollapsibleSection
        title="Your Loans"
        headerExtra={
          <Link href="/loans" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        }
      >
        <LoanList loans={loans} />
      </CollapsibleSection>
    </div>
  );
}
