/**
 * @jest-environment node
 */

// ---- Mocks ----------------------------------------------------------------

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

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

// ---- Imports (after mocks) -------------------------------------------------

import { NextRequest } from "next/server";
import { GET as getLoans, POST as postLoan } from "@/app/api/loans/route";
import {
  GET as getLoan,
  PUT as putLoan,
  DELETE as deleteLoan,
} from "@/app/api/loans/[id]/route";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockFindMany = prisma.loan.findMany as jest.MockedFunction<
  typeof prisma.loan.findMany
>;
const mockFindUnique = prisma.loan.findUnique as jest.MockedFunction<
  typeof prisma.loan.findUnique
>;
const mockCreate = prisma.loan.create as jest.MockedFunction<
  typeof prisma.loan.create
>;
const mockUpdate = prisma.loan.update as jest.MockedFunction<
  typeof prisma.loan.update
>;
const mockDelete = prisma.loan.delete as jest.MockedFunction<
  typeof prisma.loan.delete
>;

const SESSION = {
  user: { id: "user-1", email: "test@test.com", name: "Test" },
  expires: "2099-01-01",
};

const LOAN = {
  id: "loan-1",
  name: "Test Loan",
  amount: 10000,
  interest: 5,
  partialAmortRate: 0,
  totalAmortRate: 0,
  months: 12,
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(body?: object, method = "GET") {
  return new NextRequest("http://localhost/api/loans", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

// ---- GET /api/loans -------------------------------------------------------

describe("GET /api/loans", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await getLoans();
    expect(res.status).toBe(401);
  });

  it("returns only the authenticated user's loans", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindMany.mockResolvedValueOnce([LOAN] as never);

    const res = await getLoans();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("loan-1");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
  });
});

// ---- POST /api/loans -------------------------------------------------------

describe("POST /api/loans", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = makeRequest(
      { name: "Loan", amount: 1000, interest: 5, months: 12 },
      "POST"
    );
    const res = await postLoan(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    const req = makeRequest({ name: "Loan" }, "POST");
    const res = await postLoan(req);
    expect(res.status).toBe(400);
  });

  it("creates a loan and returns 201", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockCreate.mockResolvedValueOnce(LOAN as never);

    const req = makeRequest(
      { name: "Loan", amount: 10000, interest: 5, months: 12 },
      "POST"
    );
    const res = await postLoan(req);
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1" }),
      })
    );
  });
});

// ---- GET /api/loans/[id] ---------------------------------------------------

describe("GET /api/loans/[id]", () => {
  it("returns 403 when loan belongs to another user", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindUnique.mockResolvedValueOnce({
      ...LOAN,
      userId: "other-user",
    } as never);

    const req = makeRequest();
    const res = await getLoan(req, {
      params: Promise.resolve({ id: "loan-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns the loan when ownership matches", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindUnique.mockResolvedValueOnce(LOAN as never);

    const req = makeRequest();
    const res = await getLoan(req, {
      params: Promise.resolve({ id: "loan-1" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("loan-1");
  });
});

// ---- PUT /api/loans/[id] ---------------------------------------------------

describe("PUT /api/loans/[id]", () => {
  it("returns 403 when loan belongs to another user", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindUnique.mockResolvedValueOnce({
      ...LOAN,
      userId: "other-user",
    } as never);

    const req = makeRequest({ name: "Updated" }, "PUT");
    const res = await putLoan(req, {
      params: Promise.resolve({ id: "loan-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("updates the loan when ownership matches", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindUnique.mockResolvedValueOnce(LOAN as never);
    mockUpdate.mockResolvedValueOnce({ ...LOAN, name: "Updated" } as never);

    const req = makeRequest({ name: "Updated" }, "PUT");
    const res = await putLoan(req, {
      params: Promise.resolve({ id: "loan-1" }),
    });
    expect(res.status).toBe(200);
  });
});

// ---- DELETE /api/loans/[id] ------------------------------------------------

describe("DELETE /api/loans/[id]", () => {
  it("returns 403 when loan belongs to another user", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindUnique.mockResolvedValueOnce({
      ...LOAN,
      userId: "other-user",
    } as never);

    const req = makeRequest();
    const res = await deleteLoan(req, {
      params: Promise.resolve({ id: "loan-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("deletes the loan when ownership matches", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindUnique.mockResolvedValueOnce(LOAN as never);
    mockDelete.mockResolvedValueOnce(LOAN as never);

    const req = makeRequest();
    const res = await deleteLoan(req, {
      params: Promise.resolve({ id: "loan-1" }),
    });
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "loan-1" } });
  });
});
