import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const loan = await prisma.loan.findUnique({ where: { id } });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (loan.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(loan);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const loan = await prisma.loan.findUnique({ where: { id } });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (loan.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, amount, interest, partialAmortRate, totalAmortRate, months } =
    body;

  const updated = await prisma.loan.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name) }),
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(interest !== undefined && { interest: Number(interest) }),
      ...(partialAmortRate !== undefined && {
        partialAmortRate: Number(partialAmortRate),
      }),
      ...(totalAmortRate !== undefined && {
        totalAmortRate: Number(totalAmortRate),
      }),
      ...(months !== undefined && { months: Number(months) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const loan = await prisma.loan.findUnique({ where: { id } });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (loan.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.loan.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
