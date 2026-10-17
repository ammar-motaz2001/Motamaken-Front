"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Overview } from "../../types";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS } from "./colors";

const SERIES = [
  { key: "users", color: CHART_COLORS.brand },
  { key: "projects", color: CHART_COLORS.orange },
  { key: "proposals", color: CHART_COLORS.link },
] as const;

type Key = (typeof SERIES)[number]["key"];

/** Sign-ups, new projects and offers per day, as soft area lines; each line can be switched off from the legend. */
export function GrowthChart({ series }: { series: Overview["series"] }) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  const rtl = locale === "ar";
  const [hidden, setHidden] = useState<Set<Key>>(new Set());
  const day = (value: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(value));
  const totals = Object.fromEntries(SERIES.map(({ key }) => [key, series.reduce((sum, row) => sum + row[key], 0)])) as Record<Key, number>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {SERIES.map(({ key, color }) => {
          const off = hidden.has(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={!off}
              onClick={() =>
                setHidden((current) => {
                  const next = new Set(current);
                  if (off) next.delete(key);
                  else next.add(key);
                  return next;
                })
              }
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-opacity ${off ? "border-border opacity-50" : "border-border bg-surface-muted"}`}
            >
              <span className="size-2.5 rounded-full" style={{ background: color }} />
              <span className="text-muted">{t(`series.${key}`)}</span>
              <span className="font-bold">{totals[key]}</span>
            </button>
          );
        })}
      </div>
      <div className="h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              {SERIES.map(({ key, color }) => (
                <linearGradient key={key} id={`growth-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={day} reversed={rtl} tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} orientation={rtl ? "right" : "left"} tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: CHART_COLORS.grid }}
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  label={label ? day(String(label)) : undefined}
                  rows={(payload ?? []).map((item) => ({ name: t(`series.${item.dataKey as Key}`), value: String(item.value), color: String(item.color) }))}
                />
              )}
            />
            {SERIES.filter(({ key }) => !hidden.has(key)).map(({ key, color }) => (
              <Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2.5} fill={`url(#growth-${key})`} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
