"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { useCities } from "@/components/ui/useCities";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { Category, Country, SearchType } from "@/lib/api/types";
import { toQuery } from "@/lib/params";

type SearchValues = Partial<Record<"q" | "category" | "budgetMin" | "budgetMax" | "skill" | "minRating" | "platform" | "countryId" | "cityId" | "sort", string>>;

const PLATFORMS = ["instagram", "facebook", "youtube", "tiktok", "snapchat", "x", "pinterest", "telegram", "whatsapp", "linkedin"];

type SearchFiltersProps = { type: SearchType; values: SearchValues; categories: Category[]; countries: Country[]; view: string; advanced: boolean };

/** Search side filters that change with the type (budget and category for projects; skill, rating, platform for profiles). */
export function SearchFilters({ type, values, categories, countries, view, advanced }: SearchFiltersProps) {
  const t = useTranslations("Search.filters");
  const p = useTranslations("PublicProfile");
  const router = useRouter();
  const [form, setForm] = useState<SearchValues>(values);
  const [skills, setSkills] = useState<string[]>([]);
  const cities = useCities(form.countryId ?? "");
  const isProjects = type === "projects" || type === "influencer_requests";
  const isProfiles = type === "freelancers" || type === "influencers";

  useEffect(() => {
    if (!isProfiles) return;
    api<{ data: string[] }>("/search/skills").then(({ data }) => setSkills(data)).catch(() => setSkills([]));
  }, [isProfiles]);

  const set = (key: keyof SearchValues, value: string) =>
    setForm((current) => ({ ...current, [key]: value || undefined, ...(key === "countryId" ? { cityId: undefined } : {}) }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const kept = advanced ? form : { q: form.q, countryId: form.countryId, cityId: form.cityId };
    router.push(`/search${toQuery({ ...kept, type: type === "all" ? undefined : type, view: view === "list" ? "list" : undefined, advanced: advanced ? "1" : undefined })}`);
  };

  const reset = () => {
    setForm({});
    router.push(`/search${toQuery({ type: type === "all" ? undefined : type, advanced: advanced ? "1" : undefined })}`);
  };

  const categoryType = type === "influencer_requests" || type === "influencers" ? "influencer" : "project";
  const options = (items: { value: string; label: string }[]) => [{ value: "", label: t("any") }, ...items];

  return (
    <form id="search-filters" onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <label className="flex h-11 items-center gap-2 rounded-md border border-border px-3 focus-within:border-brand">
        <Search className="size-4 text-muted" aria-hidden />
        <input
          value={form.q ?? ""}
          onChange={(event) => set("q", event.target.value)}
          placeholder={t(isProfiles ? "namePlaceholder" : "placeholder")}
          aria-label={t("placeholder")}
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      {advanced && type !== "all" && (
        <div className="pop-down grid gap-4 sm:grid-cols-2">
          {isProjects && (
            <>
              <Select
                label={t("section")}
                value={form.category ?? ""}
                options={options(categories.filter((item) => item.type === categoryType).map((item) => ({ value: item.slug, label: item.name })))}
                onChange={(event) => set("category", event.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Field label={t("budgetMin")} type="number" min={0} dir="ltr" value={form.budgetMin ?? ""} onChange={(event) => set("budgetMin", event.target.value)} />
                <Field label={t("budgetMax")} type="number" min={0} dir="ltr" value={form.budgetMax ?? ""} onChange={(event) => set("budgetMax", event.target.value)} />
              </div>
            </>
          )}
          {isProfiles && (
            <>
              <Field label={t("skill")} placeholder={t("skillPlaceholder")} list="search-skills" value={form.skill ?? ""} onChange={(event) => set("skill", event.target.value)} />
              <datalist id="search-skills">
                {skills.map((skill) => (
                  <option key={skill} value={skill} />
                ))}
              </datalist>
              <Select
                label={t("rating")}
                value={form.minRating ?? ""}
                options={options(["4.5", "4", "3"].map((value) => ({ value, label: t("ratingAtLeast", { rating: value }) })))}
                onChange={(event) => set("minRating", event.target.value)}
              />
              {type === "influencers" && (
                <Select
                  label={t("platform")}
                  value={form.platform ?? ""}
                  options={options(PLATFORMS.map((value) => ({ value, label: p(`platforms.${value}`) })))}
                  onChange={(event) => set("platform", event.target.value)}
                />
              )}
            </>
          )}
          <Select
            label={t("country")}
            value={form.countryId ?? ""}
            options={options(countries.map((item) => ({ value: String(item.id), label: item.name })))}
            onChange={(event) => set("countryId", event.target.value)}
          />
          <Select
            label={t("city")}
            value={form.cityId ?? ""}
            disabled={!cities.length}
            options={options(cities.map((item) => ({ value: String(item.id), label: item.name })))}
            onChange={(event) => set("cityId", event.target.value)}
          />
          <Select
            label={t("sort")}
            value={form.sort ?? ""}
            options={(isProjects ? ["newest", "budget_high", "budget_low"] : ["rating", "reviews", "newest"]).map((value) => ({ value, label: t(`sorts.${value}`) }))}
            onChange={(event) => set("sort", event.target.value)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="submit" variant="solid" font="button" className="min-w-40">
          <SlidersHorizontal className="size-4" />
          {t("search")}
        </Button>
        <Link
          href={`/search${toQuery({ q: form.q, type: type === "all" && !advanced ? "projects" : type === "all" ? undefined : type, advanced: advanced ? undefined : "1" })}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          {t(advanced ? "simple" : "advanced")}
        </Link>
        {Object.values(values).some(Boolean) && (
          <button type="button" onClick={reset} className="text-sm text-muted hover:text-foreground">
            {t("clear")}
          </button>
        )}
      </div>
    </form>
  );
}
