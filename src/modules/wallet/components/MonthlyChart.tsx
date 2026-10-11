"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export type MonthlyRow = { month: string; income: number; spending: number };

const HEIGHT = 160;

export function MonthlyChart({ rows, currency }: { rows: MonthlyRow[]; currency: string }) {
  const t = useTranslations("Wallet.chart");
  const locale = useLocale();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...rows.flatMap((row) => [row.income, row.spending]));
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  const month = (value: string) => new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(`${value}-01T00:00:00`));
  const empty = rows.every((row) => !row.income && !row.spending);

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold">{t("title")}</span>
        <span className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-chart-income" aria-hidden />
            {t("income")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="hatch size-2.5 rounded-sm bg-chart-spending" aria-hidden />
            {t("spending")}
          </span>
        </span>
      </figcaption>

      {empty ? (
        <p className="py-10 text-center text-sm text-muted">{t("empty")}</p>
      ) : (
        <div className="relative">
          <div className="absolute inset-x-0 bottom-6 border-t border-border" aria-hidden />
          <ul className="flex items-end justify-around gap-2" style={{ height: HEIGHT + 24 }}>
            {rows.map((row, index) => (
              <li
                key={row.month}
                className="relative flex flex-1 flex-col items-center gap-1.5"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                aria-label={t("aria", { month: month(row.month), income: money(row.income), spending: money(row.spending) })}
              >
                {active === index && (
                  <div role="tooltip" className="absolute bottom-full z-10 mb-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap shadow-card">
                    <p className="font-bold">{month(row.month)}</p>
                    <p>
                      {t("income")}: {money(row.income)}
                    </p>
                    <p>
                      {t("spending")}: {money(row.spending)}
                    </p>
                  </div>
                )}
                <div className="flex items-end gap-0.5" style={{ height: HEIGHT }}>
                  <span className="w-3 rounded-t bg-chart-income sm:w-4" style={{ height: Math.max(2, (row.income / max) * HEIGHT) }} />
                  <span className="hatch w-3 rounded-t bg-chart-spending sm:w-4" style={{ height: Math.max(2, (row.spending / max) * HEIGHT) }} />
                </div>
                <span className="text-xs text-muted">{month(row.month)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}
