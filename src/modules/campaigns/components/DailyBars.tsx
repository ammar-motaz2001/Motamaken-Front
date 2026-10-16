import { getFormatter } from "next-intl/server";

type Bar = { date: string; value: number; secondary?: number };

/**
 * A small bar chart: one bar per day, the optional second value stacked on top in a muted colour.
 */
export async function DailyBars({ bars, label, format: formatValue }: { bars: Bar[]; label: string; format?: (value: number) => string }) {
  const format = await getFormatter();
  const max = Math.max(1, ...bars.map((bar) => bar.value + (bar.secondary ?? 0)));

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-bold">{label}</figcaption>
      <ul className="flex h-36 items-end justify-around gap-1 border-b border-border" dir="ltr">
        {bars.map((bar) => (
          <li key={bar.date} className="flex flex-1 flex-col items-center justify-end" title={`${bar.date}: ${formatValue ? formatValue(bar.value) : bar.value}${bar.secondary ? ` (+${bar.secondary})` : ""}`}>
            {bar.secondary ? <span className="w-full max-w-5 rounded-t bg-border" style={{ height: (bar.secondary / max) * 120 }} /> : null}
            <span className={`w-full max-w-5 bg-chart-income ${bar.secondary ? "" : "rounded-t"}`} style={{ height: Math.max(bar.value ? 3 : 1, (bar.value / max) * 120) }} />
          </li>
        ))}
      </ul>
      <ul className="flex justify-around text-[10px] text-muted" dir="ltr">
        {bars.map((bar, index) => (
          <li key={bar.date} className="flex-1 text-center">
            {index % 2 === 0 ? format.dateTime(new Date(`${bar.date}T00:00:00`), { day: "numeric", month: "short" }) : ""}
          </li>
        ))}
      </ul>
    </figure>
  );
}
