import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LoanList } from "@/components/loans/LoanList";
import { PaginationBar } from "@/components/ui/PaginationBar";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Layout already redirects unauthenticated users; auth() here gets the session.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [total, loans] = await Promise.all([
    prisma.loan.count({ where: { userId: session.user.id } }),
    prisma.loan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Loans</h1>
        <Link
          href="/loans/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Loan
        </Link>
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500 mb-4">No loans found.</p>
          <Link
            href="/loans/new"
            className="text-blue-600 hover:underline text-sm"
          >
            Create your first loan
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <LoanList loans={loans} />
          <PaginationBar page={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
