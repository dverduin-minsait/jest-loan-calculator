import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  applyExtraAmortization,
  generateChartData,
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
});
