import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LoanUpdateSchema } from "@/lib/schemas";
import { getLoan, updateLoan, deleteLoan } from "@/lib/services/loans";
import { ServiceError } from "@/lib/services/service-error";

function serviceErrorResponse(e: unknown) {
  if (e instanceof ServiceError) {
    const status = e.code === "NOT_FOUND" ? 404 : 403;
    return NextResponse.json({ error: e.message }, { status });
  }
  throw e;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const loan = await getLoan(id, session.user.id);
    return NextResponse.json(loan);
  } catch (e) {
    return serviceErrorResponse(e);
  }
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
  const body = await req.json();
  const parsed = LoanUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const updated = await updateLoan(id, session.user.id, parsed.data);
    return NextResponse.json(updated);
  } catch (e) {
    return serviceErrorResponse(e);
  }
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
  try {
    await deleteLoan(id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return serviceErrorResponse(e);
  }
}
