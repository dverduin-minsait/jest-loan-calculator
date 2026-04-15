/**
 * @jest-environment node
 */

// ---- Mocks ----------------------------------------------------------------

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
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

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

// ---- Imports (after mocks) -------------------------------------------------

import { NextRequest } from "next/server";
import { POST as register } from "@/app/api/users/route";
import {
  GET as getUser,
  PUT as updateUser,
  DELETE as deleteUser,
} from "@/app/api/users/[id]/route";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<
  typeof prisma.user.findUnique
>;
const mockCreate = prisma.user.create as jest.MockedFunction<
  typeof prisma.user.create
>;
const mockDelete = prisma.user.delete as jest.MockedFunction<
  typeof prisma.user.delete
>;
const mockHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

const SESSION = {
  user: { id: "user-1", email: "a@b.com", name: "User A" },
  expires: "2099-01-01",
};

const USER = {
  id: "user-1",
  email: "a@b.com",
  name: "User A",
  savings: 0,
  income: 0,
};

function makeRequest(body?: object, method = "POST") {
  return new NextRequest("http://localhost/api/users", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

// ---- POST /api/users (register) -------------------------------------------

describe("POST /api/users", () => {
  it("returns 400 when fields are missing", async () => {
    const req = makeRequest({ email: "a@b.com" });
    const res = await register(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const req = makeRequest({ email: "notanemail", name: "User", password: "password123" });
    const res = await register(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const req = makeRequest({ email: "a@b.com", name: "User", password: "abc" });
    const res = await register(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when email is already registered", async () => {
    mockFindUnique.mockResolvedValueOnce(USER as never);
    const req = makeRequest({
      email: "a@b.com",
      name: "User A",
      password: "password123",
    });
    const res = await register(req);
    expect(res.status).toBe(409);
  });

  it("hashes the password and creates the user", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce(USER as never);

    const req = makeRequest({
      email: "new@user.com",
      name: "New User",
      password: "securepass",
    });
    const res = await register(req);
    expect(res.status).toBe(201);
    expect(mockHash).toHaveBeenCalledWith("securepass", 12);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "hashed-password" }),
      })
    );
  });
});

// ---- GET /api/users/[id] ---------------------------------------------------

describe("GET /api/users/[id]", () => {
  it("returns 403 when requesting another user's data", async () => {
    mockAuth.mockResolvedValueOnce({
      ...SESSION,
      user: { ...SESSION.user, id: "user-99" },
    } as never);
    mockFindUnique.mockResolvedValueOnce(USER as never);

    const req = makeRequest(undefined, "GET");
    const res = await getUser(req, {
      params: Promise.resolve({ id: "user-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns user data for own account", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockFindUnique.mockResolvedValueOnce({ ...USER, createdAt: new Date() } as never);

    const req = makeRequest(undefined, "GET");
    const res = await getUser(req, {
      params: Promise.resolve({ id: "user-1" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("user-1");
  });
});

// ---- DELETE /api/users/[id] ------------------------------------------------

describe("DELETE /api/users/[id]", () => {
  it("returns 403 when deleting another user", async () => {
    mockAuth.mockResolvedValueOnce({
      ...SESSION,
      user: { ...SESSION.user, id: "user-99" },
    } as never);

    const req = makeRequest(undefined, "DELETE");
    const res = await deleteUser(req, {
      params: Promise.resolve({ id: "user-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("deletes account when ownership matches", async () => {
    mockAuth.mockResolvedValueOnce(SESSION as never);
    mockDelete.mockResolvedValueOnce(USER as never);

    const req = makeRequest(undefined, "DELETE");
    const res = await deleteUser(req, {
      params: Promise.resolve({ id: "user-1" }),
    });
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
