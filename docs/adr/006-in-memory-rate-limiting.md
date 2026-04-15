# ADR-006: In-Memory Sliding-Window Rate Limiting

## Status
Accepted

## Context
Two endpoints are vulnerable to brute-force or flooding attacks:

- `POST /api/users` — registration; unlimited calls reveal whether emails are taken
- `authorize()` in NextAuth — password guessing

Options considered:

1. **External rate-limit service** (Redis + rate-limiter-flexible, Upstash, etc.)
2. **Edge middleware** (Vercel/Cloudflare rate limiting)
3. **In-process in-memory store**

For a self-hosted learning project, external infrastructure is excessive.
Edge middleware would require a deployment platform. An in-process implementation
suffices for the deployment target.

## Decision
Implement a **sliding-window in-memory rate limiter** in `src/lib/rate-limit.ts`:

- `Map<key, { timestamps: number[] }>` stores per-key request timestamps
- On each call: prune timestamps older than the window, reject if count ≥ max
- Keys: `register:<ip>` (5 req / 15 min), `login:<email>` (10 req / 15 min)

The IP is read from `x-forwarded-for` (first value) or `x-real-ip` headers.
Falls back to `"unknown"` if neither is present (applies a shared limit bucket
to all requests without an IP header).

## Consequences
**Positive**
- Zero external dependencies
- Fully testable with `jest.useFakeTimers()`
- Sufficient protection for a single-server deployment

**Negative**
- **State is lost on server restart** — rate limit counters reset on every cold
  start / deployment. An attacker can bypass limits by triggering a restart.
- **Memory leak potential** — Map entries are never fully deleted, only their
  timestamps are pruned. The Map grows as unique keys accumulate over the
  process lifetime.
- **Not distributed** — a multi-instance deployment would need Redis or similar.
- **IP spoofing** — `x-forwarded-for` can be forged if not behind a trusted
  reverse proxy. The `unknown` fallback bucket shares rate between all spoofed
  requests.
