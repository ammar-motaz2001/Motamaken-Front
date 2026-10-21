"use client";

import { useLocale } from "next-intl";

/** Returns a formatter for amounts in the given currency and the page language. */
export function useMoney(currency: string) {
  const locale = useLocale();
  const format = new Intl.NumberFormat(locale, { style: "currency", currency });
  return (value: number) => format.format(value);
}
