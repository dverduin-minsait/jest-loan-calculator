import { NextRequest, NextResponse } from "next/server";
import { UserCreateSchema } from "@/lib/schemas";
import { createUser } from "@/lib/services/users";
import { ServiceError } from "@/lib/services/service-error";
import { checkRateLimit } from "@/lib/rate-limit";

/** Max 5 registration attempts per IP per 15 minutes */
const REGISTER_MAX = 5;
const REGISTER_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(`register:${ip}`, REGISTER_MAX, REGISTER_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests, please try again later" },
      { status: 429 }
    );
  }

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
