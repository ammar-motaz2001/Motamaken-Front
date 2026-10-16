import { useTranslations } from "next-intl";

const COLORS = ["#f97316", "#ef4444", "#a855f7", "#0ea5e9", "#eab308", "#64748b", "#14b8a6"];

/**
 * The pie chart of why visits were filtered, drawn with a conic gradient (no chart library).
 */
export function RejectionDonut({ rejections }: { rejections: { reason: string; label: string; count: number }[] }) {
  const t = useTranslations("Campaigns.detail");
  const total = rejections.reduce((sum, row) => sum + row.count, 0);

  if (!total) return <p className="text-sm text-muted">{t("noRejections")}</p>;

  // Each slice starts where the ones before it end.
  const ends = rejections.map((_, index) => (rejections.slice(0, index + 1).reduce((sum, row) => sum + row.count, 0) / total) * 360);
  const stops = rejections.map((_, index) => `${COLORS[index % COLORS.length]} ${index ? ends[index - 1] : 0}deg ${ends[index]}deg`);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative size-36 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(", ")})` }} role="img" aria-label={t("why")}>
        <span className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-surface text-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted">{t("rejected")}</span>
        </span>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {rejections.map((row, index) => (
          <li key={row.reason} className="flex items-center gap-2">
            <span className="size-3 rounded-sm" style={{ background: COLORS[index % COLORS.length] }} />
            <span>{row.label}</span>
            <span className="font-bold">{row.count}</span>
            <span className="text-xs text-muted">({Math.round((row.count / total) * 100)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
