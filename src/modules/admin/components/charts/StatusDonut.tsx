"use client";

import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS } from "./colors";

const COLORS: Record<string, string> = {
  open: CHART_COLORS.brand,
  in_progress: CHART_COLORS.link,
  completed: CHART_COLORS.brandLight,
  closed: CHART_COLORS.orange,
};

/** Every project by status, with the total in the middle. */
export function StatusDonut({ projects }: { projects: Record<string, number> }) {
  const t = useTranslations("Admin.overview.status");
  const td = useTranslations("Admin.dashboard");
  const locale = useLocale();
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const data = Object.entries(projects).map(([status, value]) => ({ status, name: t(status), value }));
  const total = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={total ? data : [{ status: "none", name: "", value: 1 }]} dataKey="value" innerRadius="70%" outerRadius="100%" paddingAngle={total ? 2 : 0} stroke="none" startAngle={90} endAngle={-270}>
              {(total ? data : [{ status: "none" }]).map((row) => (
                <Cell key={row.status} fill={COLORS[row.status] ?? CHART_COLORS.grid} />
              ))}
            </Pie>
            {total > 0 && (
              <Tooltip content={({ active, payload }) => <ChartTooltip active={active} rows={(payload ?? []).map((item) => ({ name: String(item.name), value: number(Number(item.value)), color: COLORS[(item.payload as { status: string }).status] }))} />} />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{number(total)}</span>
          <span className="text-xs text-muted">{td("projectsTotal")}</span>
        </div>
      </div>
      <ul className="flex w-full min-w-0 flex-col gap-2.5">
        {data.map((row) => (
          <li key={row.status} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: COLORS[row.status] }} />
              {row.name}
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="font-semibold">{number(row.value)}</span>
              <span className="w-10 text-end text-xs text-muted">{total ? Math.round((row.value / total) * 100) : 0}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
