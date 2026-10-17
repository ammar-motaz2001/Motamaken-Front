"use client";

/** The hover card every dashboard chart uses, in the site's surface colours (works in dark mode). */
export function ChartTooltip({
  active,
  label,
  rows,
}: {
  active?: boolean;
  label?: string;
  rows: { name: string; value: string; color: string }[];
}) {
  if (!active || !rows.length) return null;

  return (
    <div className="min-w-40 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-card">
      {label && <p className="mb-1.5 font-semibold text-foreground">{label}</p>}
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="size-2 rounded-full" style={{ background: row.color }} />
              {row.name}
            </span>
            <span className="font-semibold text-foreground">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

