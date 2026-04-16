/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listPayments, createPayment } from "@/lib/services/payments";
import { ServiceError } from "@/lib/services/service-error";
import { z } from "zod";

const PaymentCreateSchema = z.object({
  amount: z.number().positive(),
  paidAt: z.string().datetime({ offset: true }).optional(),
  note: z.string().max(500).optional(),
  type: z.enum(["regular", "extra"]).optional(),
});

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
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const payments = await listPayments(id, session.user.id);
    return NextResponse.json(payments);
  } catch (e) {
    return serviceErrorResponse(e);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = PaymentCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );

  try {
    const payment = await createPayment(id, session.user.id, parsed.data);
    return NextResponse.json(payment, { status: 201 });
  } catch (e) {
    return serviceErrorResponse(e);
  }
}
