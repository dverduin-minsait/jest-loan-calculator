import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loans = await prisma.loan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(loans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, amount, interest, partialAmortRate, totalAmortRate, months } =
    body;

  if (!name || amount == null || interest == null || months == null) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (String(name).length > 255) {
    return NextResponse.json(
      { error: "Loan name must be 255 characters or fewer" },
      { status: 400 }
    );
  }

  const loan = await prisma.loan.create({
    data: {
      name: String(name),
      amount: Number(amount),
      interest: Number(interest),
      partialAmortRate: Number(partialAmortRate ?? 0),
      totalAmortRate: Number(totalAmortRate ?? 0),
      months: Number(months),
      userId: session.user.id,
    },
  });

  return NextResponse.json(loan, { status: 201 });
}
