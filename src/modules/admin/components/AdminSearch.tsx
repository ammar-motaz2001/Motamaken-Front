"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Listbox } from "@/components/ui/Listbox";
import { usePathname, useRouter } from "@/i18n/navigation";

type Filter = { name: string; label: string; options: { value: string; label: string }[] };

type TextFilter = { name: string; label: string };

/**
 * Search box plus optional select filters, extra text fields (a reference, a user id) and a date range; everything lives
 * in the URL so pages stay server-rendered.
 */
export function AdminSearch({ placeholder, filters = [], texts = [], dates = false }: { placeholder?: string; filters?: Filter[]; texts?: TextFilter[]; dates?: boolean }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [extra, setExtra] = useState<Record<string, string>>(() => Object.fromEntries(texts.map((field) => [field.name, params.get(field.name) ?? ""])));

  const go = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    go({ ...(placeholder !== undefined ? { q: q.trim() } : {}), ...Object.fromEntries(Object.entries(extra).map(([key, value]) => [key, value.trim()])) });
  };
  const hasSubmit = placeholder !== undefined || texts.length > 0;

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      {placeholder !== undefined && (
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 focus-within:border-brand sm:max-w-sm">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <span className="sr-only">{t("search")}</span>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      )}
      {texts.map((field) => (
        <label key={field.name} className="flex h-10 w-44 items-center rounded-md border border-border bg-surface px-3 focus-within:border-brand">
          <span className="sr-only">{field.label}</span>
          <input
            value={extra[field.name] ?? ""}
            onChange={(event) => setExtra((current) => ({ ...current, [field.name]: event.target.value }))}
            placeholder={field.label}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      ))}
      {filters.map((filter) => (
        <Listbox
          key={filter.name}
          aria-label={filter.label}
          value={params.get(filter.name) ?? ""}
          onChange={(value) => go({ [filter.name]: value })}
          options={[{ value: "", label: filter.label }, ...filter.options]}
          className="w-52"
        />
      ))}
      {dates && (
        <>
          <DatePicker aria-label={t("from")} placeholder={t("from")} value={params.get("from") ?? ""} max={params.get("to") ?? undefined} onChange={(value) => go({ from: value })} className="w-40" />
          <DatePicker aria-label={t("to")} placeholder={t("to")} value={params.get("to") ?? ""} min={params.get("from") ?? undefined} onChange={(value) => go({ to: value })} className="w-40" />
          {(params.get("from") || params.get("to")) && (
            <button type="button" onClick={() => go({ from: "", to: "" })} className="text-sm text-link hover:underline">
              {t("clearDates")}
            </button>
          )}
        </>
      )}
      {hasSubmit && (
        <button type="submit" className="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:opacity-90">
          {t("search")}
        </button>
      )}
    </form>
  );
}
