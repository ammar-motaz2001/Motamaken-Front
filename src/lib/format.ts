const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3 hours ago" / "in 2 days" style text for a date, in the given language. */
export function timeAgo(date: string, locale: string) {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const [unit, size] = UNITS.find(([, size]) => Math.abs(seconds) >= size) ?? ["second", 1];
  return format.format(Math.round(seconds / size), unit);
}

/** Hour and minute of a date in the given language, e.g. for chat messages. */
export function formatTime(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

/** Money amount with its currency sign and no decimals, in the given language. */
export function formatAmount(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

/** Seconds as "mm:ss", e.g. a voice message length. */
export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
