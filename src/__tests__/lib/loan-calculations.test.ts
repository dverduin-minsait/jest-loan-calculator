import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  applyExtraAmortization,
  generateChartData,
  findOptimalAmortization,
  type LoanData,
} from "@/lib/loan-calculations";

const sampleLoan: LoanData = {
  id: "loan-1",
  name: "Car Loan",
  amount: 10000,
  interest: 6,
  months: 12,
};

const zeroInterestLoan: LoanData = {
  id: "loan-zero",
  name: "Zero Interest",
  amount: 12000,
  interest: 0,
  months: 12,
};

describe("calculateMonthlyPayment", () => {
  it("returns the correct monthly payment for a standard loan", () => {
    const payment = calculateMonthlyPayment(10000, 6, 12);
    // French amortization: 10000 * (0.5% * 1.005^12) / (1.005^12 - 1)
    expect(payment).toBeCloseTo(860.66, 1);
  });

  it("divides principal by months when interest is 0", () => {
    const payment = calculateMonthlyPayment(12000, 0, 12);
    expect(payment).toBe(1000);
  });

  it("returns 0 when months is 0", () => {
    expect(calculateMonthlyPayment(10000, 5, 0)).toBe(0);
  });

  it("handles large principal correctly", () => {
    const payment = calculateMonthlyPayment(200000, 3, 240);
    expect(payment).toBeGreaterThan(0);
    expect(payment).toBeLessThan(200000);
  });
});

describe("generateAmortizationSchedule", () => {
  it("generates the correct number of entries", () => {
    const schedule = generateAmortizationSchedule(sampleLoan);
    expect(schedule.length).toBe(12);
  });

  it("starts with the full loan amount in first interest calculation", () => {
    const schedule = generateAmortizationSchedule(sampleLoan);
    const firstEntry = schedule[0];
    // First month interest: 10000 * 0.5% = 50
    expect(firstEntry.interestPaid).toBeCloseTo(50, 2);
  });

  it("ends with a balance of 0", () => {
    const schedule = generateAmortizationSchedule(sampleLoan);
    const lastEntry = schedule[schedule.length - 1];
    expect(lastEntry.balance).toBeCloseTo(0, 2);
  });

  it("final balance is exactly 0 after rounding (no floating-point drift)", () => {
    const schedule = generateAmortizationSchedule(sampleLoan);
    expect(schedule[schedule.length - 1].balance).toBe(0);
  });

  it("balance strictly decreases over time", () => {
    const schedule = generateAmortizationSchedule(sampleLoan);
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
    }
  });

  it("works correctly for zero-interest loan", () => {
    const schedule = generateAmortizationSchedule(zeroInterestLoan);
    expect(schedule.length).toBe(12);
    expect(schedule[0].payment).toBeCloseTo(1000, 2);
    expect(schedule[11].balance).toBeCloseTo(0, 2);
  });

  describe("partialAmortRate", () => {
    it("loan with partialAmortRate finishes before one without", () => {
      const base: LoanData = { id: "b", name: "B", amount: 20000, interest: 5, months: 60 };
      const withPartial: LoanData = { ...base, id: "p", partialAmortRate: 10 };
      const normalSchedule = generateAmortizationSchedule(base);
      const partialSchedule = generateAmortizationSchedule(withPartial);
      expect(partialSchedule.length).toBeLessThan(normalSchedule.length);
    });

    it("partial amortization reduces balance at month 12", () => {
      const base: LoanData = { id: "b", name: "B", amount: 20000, interest: 5, months: 60 };
      const withPartial: LoanData = { ...base, id: "p", partialAmortRate: 10 };
      const normalSchedule = generateAmortizationSchedule(base);
      const partialSchedule = generateAmortizationSchedule(withPartial);
      const normalBalance12 = normalSchedule.find((e) => e.month === 12)!.balance;
      const partialBalance12 = partialSchedule.find((e) => e.month === 12)!.balance;
      expect(partialBalance12).toBeLessThan(normalBalance12);
    });

    it("zero partialAmortRate behaves identically to no rate", () => {
      const a: LoanData = { id: "a", name: "A", amount: 10000, interest: 5, months: 24 };
      const b: LoanData = { ...a, id: "b", partialAmortRate: 0 };
      const schedA = generateAmortizationSchedule(a);
      const schedB = generateAmortizationSchedule(b);
      expect(schedA).toEqual(schedB);
    });
  });
});

describe("applyExtraAmortization", () => {
  it("reduces the balance at the specified month", () => {
    const original = generateAmortizationSchedule(sampleLoan);
    const modified = applyExtraAmortization(sampleLoan, {
      month: 6,
      amount: 2000,
    });

    // Balance at month 6 after extra payment should be lower than original
    const originalBalance = original.find((e) => e.month === 6)!.balance;
    const modifiedBalance = modified.find((e) => e.month === 6)!.balance;
    expect(modifiedBalance).toBeLessThan(originalBalance);
  });

  it("loan finishes before or at the original end when extra payment is made", () => {
    const modified = applyExtraAmortization(sampleLoan, {
      month: 3,
      amount: 3000,
    });
    const modifiedEnd = modified[modified.length - 1].month;
    expect(modifiedEnd).toBeLessThanOrEqual(sampleLoan.months);
  });

  it("all balances are non-negative", () => {
    const modified = applyExtraAmortization(sampleLoan, {
      month: 6,
      amount: 999999,
    });
    for (const entry of modified) {
      expect(entry.balance).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("generateChartData", () => {
  it("returns empty array for empty loans list", () => {
    expect(generateChartData([])).toEqual([]);
  });

  it("has a data point for every month from 1 to max", () => {
    const data = generateChartData([sampleLoan]);
    expect(data.length).toBe(12);
    expect(data[0].month).toBe(1);
    expect(data[11].month).toBe(12);
  });

  it("includes loan ID as key and total field in each data point", () => {
    const data = generateChartData([sampleLoan]);
    expect(data[0]).toHaveProperty("loan-1");
    expect(data[0]).toHaveProperty("total");
  });

  it("total equals sum of individual loan balances", () => {
    const loan2: LoanData = {
      id: "loan-2",
      name: "Loan 2",
      amount: 5000,
      interest: 3,
      months: 24,
    };
    const data = generateChartData([sampleLoan, loan2]);

    for (const point of data) {
      const sum = (point["loan-1"] ?? 0) + (point["loan-2"] ?? 0);
      expect(point.total).toBeCloseTo(sum, 5);
    }
  });

  it("applies extra amortization when provided in extras", () => {
    const normalData = generateChartData([sampleLoan]);
    const extraData = generateChartData([sampleLoan], {
      "loan-1": { month: 6, amount: 2000 },
    });

    // The modified schedule should end sooner
    expect(extraData.length).toBeLessThanOrEqual(normalData.length);
  });

  it("produces correct data for a long 360-month loan (O(n) Map path)", () => {
    const mortgage: LoanData = {
      id: "mortgage",
      name: "Home Loan",
      amount: 200000,
      interest: 4,
      months: 360,
    };
    const data = generateChartData([mortgage]);
    expect(data.length).toBe(360);
    // Balance at month 1 should be less than full principal
    expect(data[0]["mortgage"]).toBeLessThan(200000);
    // Balance at last month should be ~0
    expect(data[359]["mortgage"]).toBeCloseTo(0, 1);
    // Cumulative paid at end should exceed principal (interest cost)
    expect(data[359]["mortgage_paid"]).toBeGreaterThan(200000);
  });
});

describe("findOptimalAmortization", () => {
  const highRateLoan: LoanData = {
    id: "high",
    name: "High Rate",
    amount: 10000,
    interest: 12,
    months: 24,
  };
  const lowRateLoan: LoanData = {
    id: "low",
    name: "Low Rate",
    amount: 10000,
    interest: 3,
    months: 24,
  };

  it("throws when loans list is empty", () => {
    expect(() => findOptimalAmortization([], 1000, 1)).toThrow("No loans provided");
  });

  it("returns the single loan as best when only one loan is provided", () => {
    const advice = findOptimalAmortization([sampleLoan], 2000, 3);
    expect(advice.bestLoanId).toBe("loan-1");
    expect(advice.ranking).toHaveLength(1);
  });

  it("picks the highest-rate loan first when balances are equal (avalanche)", () => {
    const advice = findOptimalAmortization([lowRateLoan, highRateLoan], 2000, 3);
    expect(advice.bestLoanId).toBe("high");
    expect(advice.ranking[0].loanId).toBe("high");
  });

  it("ranking is sorted descending by interestSaved", () => {
    const advice = findOptimalAmortization([lowRateLoan, highRateLoan], 2000, 3);
    for (let i = 1; i < advice.ranking.length; i++) {
      expect(advice.ranking[i].interestSaved).toBeLessThanOrEqual(
        advice.ranking[i - 1].interestSaved
      );
    }
  });

  it("interestSaved is non-negative for all entries", () => {
    const advice = findOptimalAmortization([lowRateLoan, highRateLoan], 1000, 6);
    for (const entry of advice.ranking) {
      expect(entry.interestSaved).toBeGreaterThanOrEqual(0);
    }
  });

  it("monthsSaved is non-negative for all entries", () => {
    const advice = findOptimalAmortization([lowRateLoan, highRateLoan], 1000, 6);
    for (const entry of advice.ranking) {
      expect(entry.monthsSaved).toBeGreaterThanOrEqual(0);
    }
  });

  it("best loan has more interest saved than any other entry", () => {
    const loans = [lowRateLoan, highRateLoan, sampleLoan];
    const advice = findOptimalAmortization(loans, 2000, 3);
    const bestSaved = advice.ranking[0].interestSaved;
    for (const entry of advice.ranking.slice(1)) {
      expect(bestSaved).toBeGreaterThanOrEqual(entry.interestSaved);
    }
  });

  it("produces a ranking entry for every loan", () => {
    const loans = [lowRateLoan, highRateLoan, sampleLoan];
    const advice = findOptimalAmortization(loans, 2000, 3);
    expect(advice.ranking).toHaveLength(loans.length);
  });

  it("sets warning when atMonth is beyond a loan's term", () => {
    const shortLoan: LoanData = { id: "short", name: "Short", amount: 5000, interest: 5, months: 6 };
    const longLoan: LoanData = { id: "long", name: "Long", amount: 10000, interest: 4, months: 24 };
    const advice = findOptimalAmortization([shortLoan, longLoan], 1000, 10);
    expect(advice.warning).toMatch(/Month 10 is beyond the term of: Short/);
  });

  it("warning is undefined when atMonth is within all loan terms", () => {
    const advice = findOptimalAmortization([sampleLoan], 2000, 3);
    expect(advice.warning).toBeUndefined();
  });
});
