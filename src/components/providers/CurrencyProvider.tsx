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

/** The currencies the marketplace offers (as set in the admin panel), in their order. */
export function useOfferedCurrencies(): string[] {
  return Object.keys(useContext(CurrencyContext).rates);
}

/** Formats an amount in the visitor's currency, converted from the currency it is stated in. */
export function useMoney() {
  const { currency, rates } = useContext(CurrencyContext);
  const locale = useLocale();

  return useCallback(
    (amount: number, from: string) => {
      const converted = convert(amount, from, currency, rates);
      const [value, code] = converted === null ? [amount, from] : [converted, currency];
      // Converted prices are estimates: round them; amounts in their own currency keep their cents.
      return new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: code === from ? 2 : 0 }).format(value);
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
