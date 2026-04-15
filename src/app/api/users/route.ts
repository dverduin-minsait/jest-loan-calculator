import { NextRequest, NextResponse } from "next/server";
import { UserCreateSchema } from "@/lib/schemas";
import { createUser } from "@/lib/services/users";
import { ServiceError } from "@/lib/services/service-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UserCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const user = await createUser(parsed.data);
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    if (e instanceof ServiceError && e.code === "CONFLICT") {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
