"use client";

import { useLocale, useTranslations } from "next-intl";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { convert } from "@/lib/currency";

type CurrencyState = { currency: string; rates: Record<string, number> };

const CurrencyContext = createContext<CurrencyState>({ currency: "USD", rates: { USD: 1 } });

/** Shares the visitor's display currency and the exchange rates with every price on the page. */
export function CurrencyProvider({ currency, rates, children }: CurrencyState & { children: ReactNode }) {
  return <CurrencyContext.Provider value={{ currency, rates }}>{children}</CurrencyContext.Provider>;
}

/** The visitor's display currency (the header's currency menu). */
export function useDisplayCurrency(): string {
  return useContext(CurrencyContext).currency;
}

/** The currencies the marketplace offers (as set in the admin panel), in their order. */
export function useOfferedCurrencies(): string[] {
  return Object.keys(useContext(CurrencyContext).rates);
}

/** A converted price rounded to a figure people would write: to 1 under 100, to 5 under 1,000, to 10 above. */
function tidy(value: number) {
  const step = value < 100 ? 1 : value < 1000 ? 5 : 10;
  return Math.max(step, Math.round(value / step) * step);
}

/** Formats an amount in the visitor's currency, converted from the currency it is stated in. */
export function useMoney() {
  const { currency, rates } = useContext(CurrencyContext);
  const locale = useLocale();

  return useCallback(
    (amount: number, from: string) => {
      const converted = convert(amount, from, currency, rates);
      const [value, code] = converted === null ? [amount, from] : [converted, currency];
      // Converted prices are estimates: rounded to a tidy figure. Amounts in their own currency keep their cents, but
      // whole amounts show no ".00". Wrapped in a left-to-right isolate so "US$ 400" never turns into "$US 400" in Arabic.
      const shown = code === from ? value : tidy(value);
      const text = new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol", maximumFractionDigits: code === from ? 2 : 0, trailingZeroDisplay: "stripIfInteger" }).format(shown);
      return `\u2066${text}\u2069`;
    },
    [currency, rates, locale],
  );
}

/** A price shown in the visitor's currency; the original amount is in the tooltip when it was converted. */
export function Money({ amount, currency, className }: { amount: number; currency: string; className?: string }) {
  const money = useMoney();
  const { currency: display } = useContext(CurrencyContext);
  const locale = useLocale();
  const original = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);

  return (
    <span className={className} title={display !== currency ? original : undefined} dir="ltr">
      {money(amount, currency)}
    </span>
  );
}

/** A translated budget line ("Budget {min} - {max}") with both ends in the visitor's currency. */
export function BudgetRange({ message, min, max, currency }: { message: string; min: number; max: number; currency: string }) {
  const t = useTranslations();
  const money = useMoney();
  return <>{(t as (key: string, values: Record<string, string>) => string)(message, { min: money(min, currency), max: money(max, currency) })}</>;
}
