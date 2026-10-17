"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Overview } from "../../types";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS } from "./colors";

/** Platform revenue and wallet top-ups per day, one currency at a time. */
export function RevenueChart({ series, currencies }: { series: Overview["series"]; currencies: string[] }) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  const rtl = locale === "ar";
  const [currency, setCurrency] = useState(currencies[0] ?? "USD");
  const money = (value: number, compact = false) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: compact ? 0 : 2, notation: compact ? "compact" : "standard" }).format(value);
  const day = (value: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(value));
  const data = series.map((row) => ({ date: row.date, revenue: row.revenue[currency] ?? 0, deposits: row.deposits[currency] ?? 0 }));
  const total = (key: "revenue" | "deposits") => data.reduce((sum, row) => sum + row[key], 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5">
          {(
            [
              ["revenue", CHART_COLORS.brand],
              ["deposits", CHART_COLORS.orangeLight],
            ] as const
          ).map(([key, color]) => (
            <div key={key} className="flex flex-col">
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <span className="size-2.5 rounded-sm" style={{ background: color }} />
                {t(`series.${key}`)}
              </span>
              <span className="text-lg font-bold">{money(total(key))}</span>
            </div>
          ))}
        </div>
        {currencies.length > 1 && (
          <div className="flex rounded-lg bg-surface-muted p-1" role="tablist">
            {currencies.map((code) => (
              <button
                key={code}
                type="button"
                role="tab"
                aria-selected={code === currency}
                onClick={() => setCurrency(code)}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${code === currency ? "bg-surface text-brand shadow-card" : "text-muted"}`}
              >
                {code}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-64" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }} barGap={2}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={day} reversed={rtl} tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tickFormatter={(value: number) => money(value, true)} orientation={rtl ? "right" : "left"} tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} tickLine={false} axisLine={false} width={64} />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  label={label ? day(String(label)) : undefined}
                  rows={(payload ?? []).map((item) => ({ name: t(`series.${item.dataKey as "revenue" | "deposits"}`), value: money(Number(item.value)), color: String(item.color) }))}
                />
              )}
            />
            <Bar dataKey="revenue" fill={CHART_COLORS.brand} radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="deposits" fill={CHART_COLORS.orangeLight} radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
