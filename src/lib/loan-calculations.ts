export interface LoanData {
  id: string;
  name: string;
  amount: number;
  interest: number; // annual rate in %
  months: number; // total term in months
}

export interface ScheduleEntry {
  month: number;
  balance: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
}

export interface ExtraPayment {
  month: number;
  amount: number;
}

export interface ChartDataPoint {
  month: number;
  total: number;
  [key: string]: number;
}

/**
 * French amortization: calculates the fixed monthly payment.
 * Formula: P * r * (1+r)^n / ((1+r)^n - 1)
 * Zero-interest case: P / n
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  const factor = Math.pow(1 + r, months);
  return (principal * (r * factor)) / (factor - 1);
}

/**
 * Generates a full French amortization schedule for a loan.
 */
export function generateAmortizationSchedule(loan: LoanData): ScheduleEntry[] {
  const { amount, interest, months } = loan;
  const payment = calculateMonthlyPayment(amount, interest, months);
  const r = interest / 100 / 12;
  const schedule: ScheduleEntry[] = [];
  let balance = amount;

  for (let m = 1; m <= months; m++) {
    const interestPaid = balance * r;
    const principalPaid = Math.min(payment - interestPaid, balance);
    balance = Math.max(0, balance - principalPaid);

    schedule.push({
      month: m,
      balance,
      payment: m === months ? payment - Math.max(0, balance) : payment,
      interestPaid,
      principalPaid,
    });

    if (balance === 0) break;
  }

  return schedule;
}

/**
 * Applies an extra lump-sum payment at a given month and recalculates the
 * remaining schedule using the same original monthly payment (loan finishes early).
 */
export function applyExtraAmortization(
  loan: LoanData,
  extra: ExtraPayment
): ScheduleEntry[] {
  const { amount, interest, months } = loan;
  const r = interest / 100 / 12;
  const originalPayment = calculateMonthlyPayment(amount, interest, months);
  const schedule: ScheduleEntry[] = [];
  let balance = amount;

  for (let m = 1; m <= months; m++) {
    const interestPaid = balance * r;
    const principalPaid = Math.min(originalPayment - interestPaid, balance);
    balance = Math.max(0, balance - principalPaid);

    const extraThisMonth = m === extra.month ? Math.min(extra.amount, balance) : 0;
    balance = Math.max(0, balance - extraThisMonth);

    schedule.push({
      month: m,
      balance,
      payment: originalPayment + extraThisMonth,
      interestPaid,
      principalPaid: principalPaid + extraThisMonth,
    });

    if (balance === 0) break;
  }

  return schedule;
}

/**
 * Generates chart-ready data for Recharts.
 * Returns one entry per month across all loans, with each loan's balance
 * keyed by loan ID, plus a 'total' field.
 */
export function generateChartData(
  loans: LoanData[],
  extras?: Record<string, ExtraPayment>
): ChartDataPoint[] {
  const schedules = loans.map((loan) => ({
    id: loan.id,
    schedule: extras?.[loan.id]
      ? applyExtraAmortization(loan, extras[loan.id])
      : generateAmortizationSchedule(loan),
  }));

  if (schedules.length === 0) return [];

  const maxMonth = Math.max(
    ...schedules.map((s) => s.schedule[s.schedule.length - 1]?.month ?? 0)
  );

  const data: ChartDataPoint[] = [];

  for (let m = 1; m <= maxMonth; m++) {
    const point: ChartDataPoint = { month: m, total: 0 };
    for (const { id, schedule } of schedules) {
      const entry = schedule.find((e) => e.month === m);
      const balance = entry?.balance ?? 0;
      point[id] = balance;
      point.total += balance;
    }
    data.push(point);
  }

  return data;
}
