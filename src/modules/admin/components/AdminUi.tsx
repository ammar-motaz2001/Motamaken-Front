import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/** Title row of every admin screen, with room for actions on the end side. */
export function AdminHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Bordered admin panel card with an optional title and action buttons. */
export function AdminSection({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="text-base font-bold">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Figure tile for admin dashboards (label, value, hint), coloured by tone and optionally a link. */
export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: "default" | "brand" | "orange" | "danger";
}) {
  const accent = { default: "text-foreground", brand: "text-brand", orange: "text-orange", danger: "text-danger" }[tone];
  const body = (
    <>
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-2xl font-bold ${accent}`}>{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </>
  );
  const classes = "flex flex-col gap-1 rounded-xl border border-border bg-surface p-4";

  return href ? (
    <Link href={href} className={`${classes} transition-colors hover:border-brand`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

/** A plain data table that scrolls sideways on small screens instead of breaking the page. */
export function AdminTable({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: string | false }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-start text-xs text-muted uppercase">
            {head.map((cell, index) => (
              <th key={index} className="px-3 py-2.5 text-start font-semibold whitespace-nowrap first:ps-4 sm:first:ps-3">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
      {empty && <p className="py-10 text-center text-sm text-muted">{empty}</p>}
    </div>
  );
}

/** Table cell with the admin tables' padding. */
export function Cell({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-top first:ps-4 sm:first:ps-3 ${className}`}>{children}</td>;
}

/** Status tabs driven by the URL (`?status=`). */
export function StatusTabs({
  pathname,
  current,
  tabs,
  param = "status",
  keep = {},
}: {
  pathname: string;
  current: string | undefined;
  tabs: { value: string | undefined; label: string; count?: number }[];
  param?: string;
  keep?: Record<string, string | undefined>;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => {
        const query = new URLSearchParams(
          Object.entries({ ...keep, [param]: tab.value }).filter((entry): entry is [string, string] => Boolean(entry[1])),
        ).toString();
        const active = current === tab.value;
        return (
          <Link
            key={tab.value ?? "all"}
            href={query ? `${pathname}?${query}` : pathname}
            role="tab"
            aria-selected={active}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              active ? "border-brand bg-brand text-white" : "border-border hover:border-brand"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className={`ms-1.5 ${active ? "text-white/80" : "text-muted"}`}>{tab.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}
