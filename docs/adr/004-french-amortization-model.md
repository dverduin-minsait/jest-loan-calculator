# ADR-004: French Amortization Model

## Status
Accepted

## Context
Loans need a calculation model for generating monthly payment schedules,
total interest, and what-if scenarios. Options:

1. **French (constant-payment) amortization** — fixed monthly payment, variable
   interest/principal split
2. **German (constant-principal) amortization** — fixed principal repayment,
   decreasing total payment
3. **Bullet / interest-only** — interest payments only, principal at end

The most common retail loan product in Europe (mortgages, car loans, personal
loans) uses French amortization. It is what users expect when they "enter a loan."

## Decision
Implement **French amortization** as the sole calculation model in
`src/lib/loan-calculations.ts`:

```
monthly_payment = P × (r × (1 + r)^n) / ((1 + r)^n - 1)
```

Where P = principal, r = monthly rate (annual/12/100), n = term in months.

Zero-interest case: `P / n` (equal principal, no interest).

**Floating-point precision**: The internal balance accumulator is never rounded
during iteration. Only the display values (entries in `ScheduleEntry`) are
rounded to 2 decimal places. Sub-cent residuals (<0.005) are snapped to zero.

## Consequences
**Positive**
- Matches real-world European retail loan behavior
- Fixed monthly payment is the most familiar model for end-users
- Simple closed-form formula — easy to test

**Negative**
- German amortization (sometimes seen in Belgian/Dutch mortgages) not supported
- No support for balloon payments, grace periods, or irregular schedules
- Floating-point arithmetic still accumulates tiny errors over long terms;
  the snap-to-zero mitigation works but a full fixed-point approach would
  be more rigorous
