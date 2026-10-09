import prisma from "@/lib/dbClient/prisma";
import { convertUsd, formatMoney, priceOf } from "@/lib/money";

export { convertUsd, formatMoney, priceOf };

export const CURRENCIES = ["USD", "INR", "PKR", "BDT", "USDT"] as const;

export type Currency = (typeof CURRENCIES)[number];

let cached: { at: number; rates: Record<string, number> } | null = null;
const CACHE_MS = 10 * 60 * 1000;

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const loadFallback = async () => {
  const rows = await prisma.currencyRate.findMany();
  const rates: Record<string, number> = { USD: 1 };
  for (const row of rows) {
    rates[row.code] = row.perUsd;
  }
  return rates;
};

export const getRates = async (): Promise<Record<string, number>> => {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.rates;
  }

  const fallback = await loadFallback();
  const rates: Record<string, number> = { ...fallback };

  const fiat = await fetchWithTimeout("https://open.er-api.com/v6/latest/USD");
  const fiatRates = (fiat as { rates?: Record<string, number> } | null)?.rates;
  if (fiatRates) {
    for (const code of ["INR", "PKR", "BDT"] as const) {
      if (typeof fiatRates[code] === "number") {
        rates[code] = fiatRates[code];
      }
    }
  }

  const crypto = await fetchWithTimeout(
    "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd",
  );
  const usdt = (crypto as { tether?: { usd?: number } } | null)?.tether?.usd;
  if (typeof usdt === "number" && usdt > 0) {
    rates["USDT"] = 1 / usdt;
  }

  cached = { at: Date.now(), rates };
  return rates;
};
