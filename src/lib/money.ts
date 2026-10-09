export const CURRENCIES = ["USD", "INR", "PKR", "BDT", "USDT"] as const;

export type Currency = (typeof CURRENCIES)[number];

const SYMBOLS: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  PKR: "Rs ",
  BDT: "৳",
  USDT: "₮",
};

export const convertUsd = (
  usd: number,
  currency: string,
  rates: Record<string, number>,
) => usd * (rates[currency] ?? 1);

export const formatMoney = (
  usd: number,
  currency: string,
  rates: Record<string, number>,
) => {
  const code =
    (CURRENCIES as readonly string[]).includes(currency) ?
      (currency as Currency)
    : "USD";
  return `${SYMBOLS[code]}${convertUsd(usd, code, rates).toFixed(2)}`;
};

export const priceOf = (product: {
  listPrice: number;
  salePrice: number | null;
}) => product.salePrice ?? product.listPrice;
