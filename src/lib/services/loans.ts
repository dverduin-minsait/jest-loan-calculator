import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";
import type { LoanCreateInput, LoanUpdateInput } from "@/lib/schemas";

export { ServiceError } from "@/lib/services/service-error";

export async function listLoans(userId: string) {
  return prisma.loan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLoan(id: string, userId: string) {
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) throw new ServiceError("NOT_FOUND", "Not found");
  if (loan.userId !== userId) throw new ServiceError("FORBIDDEN", "Forbidden");
  return loan;
}

export async function createLoan(data: LoanCreateInput & { userId: string }) {
  return prisma.loan.create({ data });
}

export async function updateLoan(
  id: string,
  userId: string,
  data: LoanUpdateInput
) {
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) throw new ServiceError("NOT_FOUND", "Not found");
  if (loan.userId !== userId) throw new ServiceError("FORBIDDEN", "Forbidden");
  return prisma.loan.update({ where: { id }, data });
}

export async function deleteLoan(id: string, userId: string) {
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) throw new ServiceError("NOT_FOUND", "Not found");
  if (loan.userId !== userId) throw new ServiceError("FORBIDDEN", "Forbidden");
  await prisma.loan.delete({ where: { id } });
}
