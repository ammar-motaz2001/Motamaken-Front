import type { StatusTone } from "@/components/ui/StatusPill";

export function money(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export function dateTime(value: string | null | undefined, locale: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function date(value: string | null | undefined, locale: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

/** One colour language for every status pill in the panel. */
export function toneFor(status: string): StatusTone {
  if (["pending", "open", "new", "draft", "under_review", "paused"].includes(status)) return "warning";
  if (["approved", "paid", "active", "handled", "actioned", "completed", "resolved", "in_progress", "drawn"].includes(status)) return "success";
  if (["rejected", "suspended", "cancelled", "closed"].includes(status)) return "danger";
  return "muted";
}
