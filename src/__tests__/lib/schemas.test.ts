import {
  LoanCreateSchema,
  LoanUpdateSchema,
  UserCreateSchema,
} from "@/lib/schemas";

describe("LoanCreateSchema", () => {
  const validLoan = {
    name: "Car Loan",
    amount: 10000,
    interest: 5,
    months: 36,
    partialAmortRate: 0,
    totalAmortRate: 0,
  };

  it("accepts valid loan data", () => {
    const result = LoanCreateSchema.safeParse(validLoan);
    expect(result.success).toBe(true);
  });

  it("applies default 0 for optional rate fields", () => {
    const result = LoanCreateSchema.safeParse({
      name: "Car Loan",
      amount: 10000,
      interest: 5,
      months: 36,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.partialAmortRate).toBe(0);
      expect(result.data.totalAmortRate).toBe(0);
    }
  });

  it("rejects empty name", () => {
    const result = LoanCreateSchema.safeParse({ ...validLoan, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 255 chars", () => {
    const result = LoanCreateSchema.safeParse({
      ...validLoan,
      name: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = LoanCreateSchema.safeParse({ ...validLoan, amount: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative interest", () => {
    const result = LoanCreateSchema.safeParse({ ...validLoan, interest: -0.1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero months", () => {
    const result = LoanCreateSchema.safeParse({ ...validLoan, months: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects fractional months", () => {
    const result = LoanCreateSchema.safeParse({ ...validLoan, months: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = LoanCreateSchema.safeParse({ name: "Car Loan" });
    expect(result.success).toBe(false);
  });
});

describe("LoanUpdateSchema", () => {
  it("accepts partial loan data", () => {
    const result = LoanUpdateSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = LoanUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still rejects invalid values when provided", () => {
    const result = LoanUpdateSchema.safeParse({ amount: -5 });
    expect(result.success).toBe(false);
  });
});

describe("UserCreateSchema", () => {
  const validUser = {
    email: "user@example.com",
    name: "Jane Doe",
    password: "securepassword",
  };

  it("accepts valid user data", () => {
    const result = UserCreateSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = UserCreateSchema.safeParse({ ...validUser, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects email longer than 255 chars", () => {
    const result = UserCreateSchema.safeParse({
      ...validUser,
      email: "a".repeat(245) + "@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = UserCreateSchema.safeParse({ ...validUser, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = UserCreateSchema.safeParse({ ...validUser, password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = UserCreateSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });
});
