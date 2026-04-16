/**
 * Shared currency formatting utility.
 * Uses the user's stored currency preference (default "EUR").
 */
export function formatCurrency(
  amount: number,
  currency = "EUR",
  maximumFractionDigits = 0
): string {
  return amount.toLocaleString("en", {
    style: "currency",
    currency,
    maximumFractionDigits,
  });
}

/** Compact format for chart axes: €10k, €1.2M */
export function formatCurrencyShort(amount: number, currency = "EUR"): string {
  if (Math.abs(amount) >= 1_000_000) {
    return formatCurrency(amount / 1_000_000, currency, 1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(amount) >= 1_000) {
    return formatCurrency(amount / 1_000, currency, 1).replace(/\.0$/, "") + "k";
  }
  return formatCurrency(amount, currency, 0);
}

/** All supported currencies with their display labels. */
export const SUPPORTED_CURRENCIES = [
  { code: "EUR", label: "Euro (€)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "SEK", label: "Swedish Krona (kr)" },
  { code: "NOK", label: "Norwegian Krone (kr)" },
  { code: "DKK", label: "Danish Krone (kr)" },
  { code: "PLN", label: "Polish Zloty (zł)" },
  { code: "BRL", label: "Brazilian Real (R$)" },
  { code: "MXN", label: "Mexican Peso ($)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "CNY", label: "Chinese Yuan (¥)" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const LOAN_CATEGORIES = [
  { value: "mortgage", label: "Mortgage" },
  { value: "car", label: "Car" },
  { value: "personal", label: "Personal" },
  { value: "student", label: "Student" },
  { value: "business", label: "Business" },
  { value: "credit_card", label: "Credit Card" },
  { value: "other", label: "Other" },
] as const;

export type LoanCategory = (typeof LOAN_CATEGORIES)[number]["value"];
