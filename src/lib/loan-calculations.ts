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
  totalPaid: number;
  [key: string]: number;
}

export interface AmortizationAdvice {
  /** The loan that will save the most total interest for a given extra payment. */
  bestLoanId: string;
  bestLoanName: string;
  /** Ranking of all loans from most to least beneficial to amortize. */
  ranking: {
    loanId: string;
    loanName: string;
    currentBalance: number;
    annualRate: number;
    totalInterestNormal: number;
    totalInterestWithExtra: number;
    interestSaved: number;
    monthsSaved: number;
  }[];
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

/** Round to a given number of decimal places to prevent floating-point drift in displayed values. */
function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Generates a full French amortization schedule for a loan.
 * The internal balance accumulator uses exact arithmetic; values stored in
 * each ScheduleEntry are rounded to 2 decimal places for display consistency.
 */
export function generateAmortizationSchedule(loan: LoanData): ScheduleEntry[] {
  const { amount, interest, months } = loan;
  const payment = calculateMonthlyPayment(amount, interest, months);
  const r = interest / 100 / 12;
  const schedule: ScheduleEntry[] = [];
  let balance = amount; // exact accumulator — do NOT round this

  for (let m = 1; m <= months; m++) {
    const interestPaid = balance * r;
    const principalPaid = Math.min(payment - interestPaid, balance);
    balance = Math.max(0, balance - principalPaid);

    // Snap sub-cent residuals to zero so the last entry reads exactly 0
    if (balance < 0.005) balance = 0;

    schedule.push({
      month: m,
      balance: round(balance),
      payment: round(principalPaid + interestPaid),
      interestPaid: round(interestPaid),
      principalPaid: round(principalPaid),
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
  let balance = amount; // exact accumulator

  for (let m = 1; m <= months; m++) {
    const interestPaid = balance * r;
    const principalPaid = Math.min(originalPayment - interestPaid, balance);
    balance = Math.max(0, balance - principalPaid);

    const extraThisMonth = m === extra.month ? Math.min(extra.amount, balance) : 0;
    balance = Math.max(0, balance - extraThisMonth);

    if (balance < 0.005) balance = 0;

    schedule.push({
      month: m,
      balance: round(balance),
      payment: round(principalPaid + interestPaid + extraThisMonth),
      interestPaid: round(interestPaid),
      principalPaid: round(principalPaid + extraThisMonth),
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

  const cumulativePaid: Record<string, number> = {};
  // Pre-build Maps for O(1) month lookup (avoids O(n²) Array.find in the loop)
  const scheduleMaps = schedules.map(({ id, schedule }) => {
    cumulativePaid[id] = 0;
    return { id, map: new Map(schedule.map((e) => [e.month, e])) };
  });

  const data: ChartDataPoint[] = [];

  for (let m = 1; m <= maxMonth; m++) {
    const point: ChartDataPoint = { month: m, total: 0, totalPaid: 0 };
    for (const { id, map } of scheduleMaps) {
      const entry = map.get(m);
      const balance = entry?.balance ?? 0;
      cumulativePaid[id] += entry?.payment ?? 0;
      point[id] = balance;
      point[`${id}_paid`] = cumulativePaid[id];
      point.total += balance;
      point.totalPaid += cumulativePaid[id];
    }
    data.push(point);
  }

  return data;
}

/**
 * Calculates total interest paid over the full life of a schedule.
 */
function totalInterest(schedule: ScheduleEntry[]): number {
  return schedule.reduce((sum, e) => sum + e.interestPaid, 0);
}

/**
 * Given a list of loans and an extra lump-sum amount applied at a given month,
 * ranks each loan by how much total interest is saved when the extra payment
 * is directed to that loan instead of any other.
 *
 * The mathematically optimal choice (avalanche method) is always the loan with
 * the highest interest rate, but the ranking also accounts for remaining balance
 * — if a loan has almost no balance left the savings will be marginal even at a
 * high rate.
 */
export function findOptimalAmortization(
  loans: LoanData[],
  extraAmount: number,
  atMonth: number
): AmortizationAdvice {
  if (loans.length === 0) {
    throw new Error("No loans provided");
  }

  const ranking = loans
    .map((loan) => {
      const normalSchedule = generateAmortizationSchedule(loan);
      const extraSchedule = applyExtraAmortization(loan, {
        month: atMonth,
        amount: extraAmount,
      });

      const normalEnd = normalSchedule[normalSchedule.length - 1]?.month ?? 0;
      const extraEnd = extraSchedule[extraSchedule.length - 1]?.month ?? 0;

      // Current balance just before the extra payment month
      const balanceEntry = normalSchedule.find((e) => e.month === atMonth - 1);
      const currentBalance =
        atMonth <= 1
          ? loan.amount
          : (balanceEntry?.balance ?? normalSchedule[0]?.balance ?? loan.amount);

      return {
        loanId: loan.id,
        loanName: loan.name,
        currentBalance,
        annualRate: loan.interest,
        totalInterestNormal: totalInterest(normalSchedule),
        totalInterestWithExtra: totalInterest(extraSchedule),
        interestSaved:
          totalInterest(normalSchedule) - totalInterest(extraSchedule),
        monthsSaved: normalEnd - extraEnd,
      };
    })
    .sort((a, b) => b.interestSaved - a.interestSaved);

  return {
    bestLoanId: ranking[0].loanId,
    bestLoanName: ranking[0].loanName,
    ranking,
  };
}
