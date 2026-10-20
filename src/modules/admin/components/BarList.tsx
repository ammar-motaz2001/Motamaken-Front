/** A ranked list with proportional bars: shares by status, reason, plan... */
export function BarList({ rows, format = (value) => String(value), empty }: { rows: { label: string; value: number; tone?: string }[]; format?: (value: number) => string; empty?: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (!rows.length) return <p className="text-sm text-muted">{empty ?? "—"}</p>;

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{row.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{format(row.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className={`h-full rounded-full ${row.tone ?? "bg-brand"}`} style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
