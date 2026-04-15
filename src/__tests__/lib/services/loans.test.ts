/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    loan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  listLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
} from "@/lib/services/loans";
import { ServiceError } from "@/lib/services/service-error";

const mockFindMany = prisma.loan.findMany as jest.MockedFunction<typeof prisma.loan.findMany>;
const mockFindUnique = prisma.loan.findUnique as jest.MockedFunction<typeof prisma.loan.findUnique>;
const mockCreate = prisma.loan.create as jest.MockedFunction<typeof prisma.loan.create>;
const mockUpdate = prisma.loan.update as jest.MockedFunction<typeof prisma.loan.update>;
const mockDelete = prisma.loan.delete as jest.MockedFunction<typeof prisma.loan.delete>;

const LOAN = {
  id: "loan-1",
  name: "My Loan",
  amount: 10000,
  interest: 5,
  partialAmortRate: 0,
  totalAmortRate: 0,
  months: 12,
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe("listLoans", () => {
  it("returns loans for the given userId", async () => {
    mockFindMany.mockResolvedValueOnce([LOAN] as never);
    const result = await listLoans("user-1");
    expect(result).toEqual([LOAN]);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
  });
});

describe("getLoan", () => {
  it("returns the loan when ownership matches", async () => {
    mockFindUnique.mockResolvedValueOnce(LOAN as never);
    const result = await getLoan("loan-1", "user-1");
    expect(result).toEqual(LOAN);
  });

  it("throws NOT_FOUND when loan does not exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    await expect(getLoan("loan-1", "user-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws FORBIDDEN when loan belongs to another user", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...LOAN, userId: "other" } as never);
    await expect(getLoan("loan-1", "user-1")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("createLoan", () => {
  it("creates a loan and returns it", async () => {
    mockCreate.mockResolvedValueOnce(LOAN as never);
    const result = await createLoan({
      name: "My Loan",
      amount: 10000,
      interest: 5,
      months: 12,
      partialAmortRate: 0,
      totalAmortRate: 0,
      userId: "user-1",
    });
    expect(result).toEqual(LOAN);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1" }) })
    );
  });
});

describe("updateLoan", () => {
  it("updates the loan when ownership matches", async () => {
    mockFindUnique.mockResolvedValueOnce(LOAN as never);
    mockUpdate.mockResolvedValueOnce({ ...LOAN, name: "Updated" } as never);
    const result = await updateLoan("loan-1", "user-1", { name: "Updated" });
    expect(result.name).toBe("Updated");
  });

  it("throws NOT_FOUND when loan does not exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    await expect(updateLoan("loan-1", "user-1", {})).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws FORBIDDEN when loan belongs to another user", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...LOAN, userId: "other" } as never);
    await expect(updateLoan("loan-1", "user-1", {})).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("deleteLoan", () => {
  it("deletes the loan when ownership matches", async () => {
    mockFindUnique.mockResolvedValueOnce(LOAN as never);
    mockDelete.mockResolvedValueOnce(LOAN as never);
    await deleteLoan("loan-1", "user-1");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "loan-1" } });
  });

  it("throws NOT_FOUND when loan does not exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    await expect(deleteLoan("loan-1", "user-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws FORBIDDEN when loan belongs to another user", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...LOAN, userId: "other" } as never);
    await expect(deleteLoan("loan-1", "user-1")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("ServiceError", () => {
  it("is an instance of Error", () => {
    const err = new ServiceError("NOT_FOUND", "test");
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("test");
  });
});
