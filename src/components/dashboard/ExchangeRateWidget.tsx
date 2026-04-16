"use client";

import { useEffect, useState } from "react";
import { fetchExchangeRates } from "@/lib/exchange-rates";
import { SUPPORTED_CURRENCIES } from "@/lib/format";

interface ExchangeRateWidgetProps {
  baseCurrency?: string;
}

export function ExchangeRateWidget({ baseCurrency = "EUR" }: ExchangeRateWidgetProps) {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchExchangeRates(baseCurrency)
      .then((r) => {
        if (r) setRates(r);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [baseCurrency]);

  const displayCurrencies = SUPPORTED_CURRENCIES.filter((c) => c.code !== baseCurrency);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading exchange rates…</p>
    );
  }

  if (error || !rates) {
    return (
      <p role="alert" className="text-sm text-red-500">
        Could not load exchange rates. Check your connection.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        1 {baseCurrency} = (live rates, cached 1 h)
      </p>
      <div className="flex flex-wrap gap-3">
        {displayCurrencies.map((c) => {
          const rate = rates[c.code];
          if (!rate) return null;
          return (
            <div
              key={c.code}
              className="px-3 py-1.5 bg-muted rounded-lg text-sm"
            >
              <span className="font-medium text-foreground">{c.code}</span>
              <span className="ml-2 text-muted-foreground">
                {rate.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
