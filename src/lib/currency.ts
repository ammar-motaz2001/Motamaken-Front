import type { Currency } from "@/lib/api/types";

/** The currency a visitor chose in the header; guests keep it in this cookie, accounts also save it on their profile. */
export const CURRENCY_COOKIE = "motamakin_currency";

/**
 * The visitor's display currency: their choice when it is still offered, else the account's, else the page's default
 * (Saudi riyal on the Arabic site, US dollar on the English one), else the first offered.
 */
export function pickDisplayCurrency(currencies: Currency[], cookie: string | undefined, account: string | undefined, locale = "en"): string {
  const offered = (code: string | undefined) => (code && currencies.some((item) => item.code === code) ? code : undefined);
  return offered(cookie) ?? offered(account) ?? offered(locale === "ar" ? "SAR" : "USD") ?? currencies[0]?.code ?? "USD";
}

/** Units per US dollar for each offered currency (1 when the API sent none). */
export function rateTable(currencies: Currency[]): Record<string, number> {
  return Object.fromEntries(currencies.map((item) => [item.code, item.rate && item.rate > 0 ? item.rate : 1]));
}

/** An amount in `from` shown in `to`, or null when either rate is unknown. */
export function convert(amount: number, from: string, to: string, rates: Record<string, number>): number | null {
  if (from === to) return amount;
  const a = rates[from];
  const b = rates[to];
  return a && b ? (amount / a) * b : null;
}
