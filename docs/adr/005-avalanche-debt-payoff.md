# ADR-005: Avalanche Method for Optimal Debt Payoff

## Status
Accepted

## Context
Users with multiple loans need guidance on where to direct extra payments. Two
well-known heuristics exist:

1. **Avalanche** — pay highest-interest-rate loan first. Mathematically optimal:
   minimises total interest paid.
2. **Snowball** — pay lowest-balance loan first. Psychologically motivating:
   produces quicker "wins" but costs more interest overall.

## Decision
Implement **avalanche** as the primary algorithm in two forms:

### One-shot advisor (`findOptimalAmortization`)
Given an extra lump-sum amount and a target month, computes and ranks each loan
by interest saved if the full extra is directed there. The best loan is the one
with the highest marginal interest saving, which correlates strongly (but not
perfectly) with the highest interest rate — balance size can make a difference
when the lump sum is large relative to remaining balance.

### Monthly simulation (`simulateMonthlyAvalanche`)
Simulates applying a fixed monthly extra payment every month, directing it to
the highest-rate active loan. When a loan pays off, its freed regular payment is
added to the available extra for subsequent months (true "snowball of freed
capacity"). Reports total interest saved, months saved, and payoff order.

## Consequences
**Positive**
- Avalanche is the mathematically correct recommendation for minimising cost
- Both tools are implemented as pure functions in `loan-calculations.ts` —
  fully testable without any UI or DB dependency
- The one-shot advisor also gives an explicit ranking so users can see *why*
  a loan was chosen

**Negative**
- No snowball option for users who prefer psychological wins
- `simulateMonthlyAvalanche` does not account for `partialAmortRate` in the
  month-by-month simulation loop (only in the baseline comparison)
- The one-shot "interest saved" ranking can give a different winner than pure
  rate ranking when lump-sum amounts are very large relative to loan balance
- No date-aware simulation (assumes all loans start at "month 1 = now")
