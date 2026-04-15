/**
 * @jest-environment node
 */

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

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-pw"),
}));

import { prisma } from "@/lib/prisma";
import {
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/services/users";
import { ServiceError } from "@/lib/services/service-error";

const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>;
const mockUpdate = prisma.user.update as jest.MockedFunction<typeof prisma.user.update>;
const mockDelete = prisma.user.delete as jest.MockedFunction<typeof prisma.user.delete>;

const USER = { id: "user-1", email: "a@b.com", name: "User A", savings: 0, income: 0 };

beforeEach(() => jest.clearAllMocks());

describe("getUser", () => {
  it("returns user when found", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...USER, createdAt: new Date() } as never);
    const result = await getUser("user-1");
    expect(result?.id).toBe("user-1");
  });

  it("returns null when user not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await getUser("no-such-user");
    expect(result).toBeNull();
  });
});

describe("createUser", () => {
  it("hashes password and creates user", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce(USER as never);
    const result = await createUser({ email: "a@b.com", name: "User A", password: "password123" });
    expect(result).toEqual(USER);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "hashed-pw" }),
      })
    );
  });

  it("throws CONFLICT when email already exists", async () => {
    mockFindUnique.mockResolvedValueOnce(USER as never);
    await expect(
      createUser({ email: "a@b.com", name: "User A", password: "password123" })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("updateUser", () => {
  it("updates user fields", async () => {
    mockUpdate.mockResolvedValueOnce({ ...USER, name: "New Name" } as never);
    const result = await updateUser("user-1", { name: "New Name" });
    expect(result.name).toBe("New Name");
  });

  it("hashes password when provided in update", async () => {
    mockUpdate.mockResolvedValueOnce(USER as never);
    await updateUser("user-1", { password: "newpassword" });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "hashed-pw" }),
      })
    );
  });
});

describe("deleteUser", () => {
  it("deletes the user", async () => {
    mockDelete.mockResolvedValueOnce(USER as never);
    await deleteUser("user-1");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
