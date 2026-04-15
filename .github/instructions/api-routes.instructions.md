---
applyTo: "src/app/api/**"
---
# API Route Instructions

## Pattern
All API routes follow this structure:

```ts
export async function METHOD(req: NextRequest, ...) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Input validation (Zod)
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // 3. Business logic (service call)
  try {
    const result = await serviceFunction(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return serviceErrorResponse(e);
  }
}
```

## Status Codes
| Situation | Code |
|---|---|
| Missing/invalid auth | 401 |
| Valid auth, wrong resource owner | 403 |
| Validation failure | 400 |
| Resource not found | 404 |
| Conflict (duplicate email) | 409 |
| Rate limit exceeded | 429 |
| Success create | 201 |
| Success read/update | 200 |
| Success delete | **204** (no body) |

## Rules
- DELETE always returns `new NextResponse(null, { status: 204 })` — no JSON body
- Never access `prisma` directly in route handlers — use `src/lib/services/`
- Use `serviceErrorResponse()` helper to map `ServiceError` to HTTP status
- Never leak stack traces or internal error messages to the client
