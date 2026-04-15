import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      savings: true,
      income: true,
      createdAt: true,
    },
  });
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ServiceError("CONFLICT", "Email already registered");
  const hashedPassword = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: { email: data.email, name: data.name, password: hashedPassword },
    select: { id: true, email: true, name: true, savings: true, income: true },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; savings?: number; income?: number; password?: string }
) {
  const updateData: {
    name?: string;
    savings?: number;
    income?: number;
    password?: string;
  } = {};

  if (data.name !== undefined) updateData.name = String(data.name);
  if (data.savings !== undefined) updateData.savings = Number(data.savings);
  if (data.income !== undefined) updateData.income = Number(data.income);
  if (data.password !== undefined) {
    updateData.password = await bcrypt.hash(String(data.password), 12);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, savings: true, income: true },
  });
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
}
