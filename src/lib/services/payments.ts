import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

export interface PaymentCreateInput {
  amount: number;
  paidAt?: string;
  note?: string;
  type?: "regular" | "extra";
}

export async function listPayments(loanId: string, userId: string) {
  // Verify loan ownership first.
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new ServiceError("NOT_FOUND", "Loan not found");
  if (loan.userId !== userId) throw new ServiceError("FORBIDDEN", "Forbidden");

  return prisma.payment.findMany({
    where: { loanId },
    orderBy: { paidAt: "desc" },
  });
}

export async function createPayment(
  loanId: string,
  userId: string,
  data: PaymentCreateInput
) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new ServiceError("NOT_FOUND", "Loan not found");
  if (loan.userId !== userId) throw new ServiceError("FORBIDDEN", "Forbidden");

  return prisma.payment.create({
    data: {
      loanId,
      amount: data.amount,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      note: data.note ?? "",
      type: data.type ?? "regular",
    },
  });
}

export async function deletePayment(id: string, userId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { loan: true },
  });
  if (!payment) throw new ServiceError("NOT_FOUND", "Payment not found");
  if (payment.loan.userId !== userId) throw new ServiceError("FORBIDDEN", "Forbidden");
  await prisma.payment.delete({ where: { id } });
}
