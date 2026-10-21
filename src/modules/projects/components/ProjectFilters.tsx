"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { outlinedPanelClasses } from "@/components/ui/styles";
import { useCities } from "@/components/ui/useCities";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Category, Country } from "@/lib/api/types";
import type { Filters } from "../lib/filters";


type ProjectFiltersProps = {
  filters: Filters;
  categories: Category[];
  countries: Country[];
  lockCategory?: boolean;
};

/** Filter form for project lists (type, category, budget, country, city...); applying it rewrites the page URL. */
export function ProjectFilters({ filters, categories, countries, lockCategory }: ProjectFiltersProps) {
  const t = useTranslations("Projects.filters");
  const router = useRouter();
  const pathname = usePathname();
  const [values, setValues] = useState<Filters>(filters);
  const cities = useCities(values.countryId ?? "");
  const categoryType = values.type === "influencer_request" ? "influencer" : "project";

  const set = (key: keyof Filters, value: string) =>
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "countryId" ? { cityId: "" } : {}),
      ...(key === "type" && !lockCategory ? { category: "" } : {}),
    }));

  const apply = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(
      Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1]) && !(lockCategory && entry[0] === "category")),
    );
    router.push(params.size ? `${pathname}?${params}` : pathname);
  };

  return (
    <form onSubmit={apply} className={`${outlinedPanelClasses} grid gap-3 md:grid-cols-4`}>
      <Field
        className="md:col-span-2"
        label={t("search")}
        type="search"
        placeholder={t("searchPlaceholder")}
        value={values.q ?? ""}
        onChange={(event) => set("q", event.target.value)}
      />
      {!lockCategory && (
        <>
          <Select
            label={t("type")}
            value={values.type ?? ""}
            options={[
              { value: "", label: t("allTypes") },
              { value: "project", label: t("projects") },
              { value: "influencer_request", label: t("influencerRequests") },
            ]}
            onChange={(event) => set("type", event.target.value)}
          />
          <Select
            label={t("category")}
            value={values.category ?? ""}
            options={[
              { value: "", label: t("allCategories") },
              ...categories
                .filter((category) => !values.type || category.type === categoryType)
                .map((category) => ({ value: category.slug, label: category.name })),
            ]}
            onChange={(event) => set("category", event.target.value)}
          />
        </>
      )}
      <Select
        label={t("country")}
        value={values.countryId ?? ""}
        options={[{ value: "", label: t("anyCountry") }, ...countries.map((item) => ({ value: String(item.id), label: item.name }))]}
        onChange={(event) => set("countryId", event.target.value)}
      />
      <Select
        label={t("city")}
        value={values.cityId ?? ""}
        disabled={!cities.length}
        options={[{ value: "", label: t("anyCity") }, ...cities.map((item) => ({ value: String(item.id), label: item.name }))]}
        onChange={(event) => set("cityId", event.target.value)}
      />
      <Field
        label={t("budgetMin")}
        type="number"
        min={0}
        value={values.budgetMin ?? ""}
        onChange={(event) => set("budgetMin", event.target.value)}
      />
      <Field
        label={t("budgetMax")}
        type="number"
        min={0}
        value={values.budgetMax ?? ""}
        onChange={(event) => set("budgetMax", event.target.value)}
      />
      <Select
        label={t("sort")}
        value={values.sort ?? ""}
        options={[
          { value: "", label: t("sortLatest") },
          { value: "budget_high", label: t("sortHigh") },
          { value: "budget_low", label: t("sortLow") },
        ]}
        onChange={(event) => set("sort", event.target.value)}
      />
      <div className="flex items-end gap-2 md:col-span-4 md:justify-end">
        <Button variant="ghost" pill onClick={() => router.push(pathname)}>
          {t("reset")}
        </Button>
        <Button type="submit" variant="solid" pill>
          {t("apply")}
        </Button>
      </div>
    </form>
  );
}
