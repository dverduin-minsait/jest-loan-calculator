"use client";

const CACHE_KEY = "exchange_rates_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface RateCache {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

export async function fetchExchangeRates(base = "EUR"): Promise<Record<string, number> | null> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: RateCache = JSON.parse(raw);
        if (cached.base === base && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
          return cached.rates;
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result !== "success") return null;

    const cache: RateCache = { base, rates: data.rates, fetchedAt: Date.now() };
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
    return data.rates as Record<string, number>;
  } catch {
    return null;
  }
}

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  // rates are relative to the base (EUR by default)
  const fromRate = rates[fromCurrency] ?? 1;
  const toRate = rates[toCurrency] ?? 1;
  return (amount / fromRate) * toRate;
}
