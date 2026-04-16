/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deletePayment } from "@/lib/services/payments";
import { ServiceError } from "@/lib/services/service-error";

function serviceErrorResponse(e: unknown) {
  if (e instanceof ServiceError) {
    const status = e.code === "NOT_FOUND" ? 404 : 403;
    return NextResponse.json({ error: e.message }, { status });
  }
  throw e;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentId } = await params;
  try {
    await deletePayment(paymentId, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return serviceErrorResponse(e);
  }
}
