import type { StatusTone } from "@/components/ui/StatusPill";

/** Money with its currency sign and up to two decimals, in the page language. */
export function money(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

/** Date and time in the page language, or a dash when there is none. */
export function dateTime(value: string | null | undefined, locale: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

/** Date only in the page language, or a dash when there is none. */
export function date(value: string | null | undefined, locale: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

/** One colour language for every status pill in the panel. */
export function toneFor(status: string): StatusTone {
  if (["pending", "open", "new", "draft", "under_review", "paused", "needs_update", "awaiting_funding", "funded", "submitted", "invited", "past_due", "high"].includes(status)) return "warning";
  if (["approved", "paid", "active", "handled", "actioned", "completed", "resolved", "in_progress", "drawn", "succeeded", "answered", "released", "accepted", "upheld", "overturned", "sent"].includes(status)) return "success";
  if (["rejected", "suspended", "cancelled", "closed", "failed", "disputed", "refunded", "declined", "disbanded", "expired", "error"].includes(status)) return "danger";
  return "muted";
}
