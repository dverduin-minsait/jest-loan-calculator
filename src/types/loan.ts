/**
 * Shared Loan type used across components, pages, and API routes.
 * Matches the Prisma Loan model shape (without relations).
 */
export interface Loan {
  id: string;
  name: string;
  amount: number;
  interest: number;
  inflationRate: number;
  partialAmortRate: number;
  totalAmortRate: number;
  months: number;
}

/**
 * Lean version used by the math library and chart components.
 * Does not include amortization rate fields (handled separately).
 */
export type LoanChartData = Pick<Loan, "id" | "name" | "amount" | "interest" | "months">;
