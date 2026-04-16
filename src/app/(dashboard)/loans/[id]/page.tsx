import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { LoanForm } from "@/components/loans/LoanForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const loan = await prisma.loan.findUnique({ where: { id } });

  if (!loan) notFound();
  if (loan.userId !== session.user.id) redirect("/loans");

  const serializedLoan = {
    ...loan,
    startDate: loan.startDate ? loan.startDate.toISOString() : null,
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Edit Loan</h1>
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <LoanForm loan={serializedLoan} />
      </div>
    </div>
  );
}
