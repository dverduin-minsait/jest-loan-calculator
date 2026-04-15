import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LoanCreateSchema } from "@/lib/schemas";
import { listLoans, createLoan } from "@/lib/services/loans";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loans = await listLoans(session.user.id);
  return NextResponse.json(loans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = LoanCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const loan = await createLoan({ ...parsed.data, userId: session.user.id });
  return NextResponse.json(loan, { status: 201 });
}
