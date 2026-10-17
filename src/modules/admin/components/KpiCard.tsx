import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

const TONES = {
  brand: "bg-brand/10 text-brand",
  orange: "bg-orange/10 text-orange",
  link: "bg-link/10 text-link",
  danger: "bg-danger/10 text-danger",
} as const;

type KpiCardProps = {
  label: string;
  value: ReactNode;
  Icon: LucideIcon;
  tone?: keyof typeof TONES;
  /** Change against the previous period, in percent; null when there is nothing to compare with. */
  delta?: number | null;
  deltaLabel?: string;
  footer?: ReactNode;
  chart?: ReactNode;
  href?: string;
};

/** A headline number with its icon, its change since the previous period and a small trend line. */
export function KpiCard({ label, value, Icon, tone = "brand", delta, deltaLabel, footer, chart, href }: KpiCardProps) {
  const up = (delta ?? 0) >= 0;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex size-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon className="size-5" aria-hidden />
        </span>
        {chart}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {delta !== undefined && delta !== null && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${up ? "bg-brand/10 text-brand" : "bg-danger/10 text-danger"}`}>
            {up ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
            {up ? "+" : ""}
            {delta}%
          </span>
        )}
        {(deltaLabel || footer) && <span className="text-muted">{footer ?? deltaLabel}</span>}
      </div>
    </>
  );
  const classes = "flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-shadow";

  return href ? (
    <Link href={href} className={`${classes} hover:shadow-card`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

/** Percent change, or null when the previous period had nothing (a "new" number, not +∞%). */
export function percentChange(current: number, previous: number) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}
