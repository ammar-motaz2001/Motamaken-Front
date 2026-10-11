"use client";

import { useLocale } from "next-intl";

export function useMoney(currency: string) {
  const locale = useLocale();
  const format = new Intl.NumberFormat(locale, { style: "currency", currency });
  return (value: number) => format.format(value);
}
