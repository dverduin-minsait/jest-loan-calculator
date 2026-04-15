---
applyTo: "src/lib/loan-calculations.ts, src/__tests__/lib/loan-calculations.test.ts"
---
# Loan Calculations Instructions

## Model
French (constant-payment) amortization:
```
payment = P × (r × (1+r)^n) / ((1+r)^n − 1)
where r = annualRate/100/12, n = months
```
Zero-interest edge case: `payment = P / n`

## Precision Rules
- Internal balance accumulator: **never round** during iteration
- `ScheduleEntry` display values: round to 2 decimal places via `round(value, 2)`
- Sub-cent residuals: snap to 0 when `balance < 0.005`
- Currency rounding: use `Math.round(value * 100) / 100` — never `toFixed()`

## Adding New Calculation Functions
1. Export an interface for the return type
2. Write tests first in `src/__tests__/lib/loan-calculations.test.ts`
3. Test: zero interest, single month, large term (360 months), empty array input
4. Keep functions pure — no side effects, no I/O
5. Throw `Error("No loans provided")` for empty array inputs (not a special return value)

## Performance
For functions called from React components, callers must use `useMemo()`.
Calculations for 30-year mortgages (360 months) run synchronously and can block
the main thread if called on every render.
