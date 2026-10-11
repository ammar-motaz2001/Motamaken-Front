"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { useDismiss } from "@/components/ui/useDismiss";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { City, Country } from "@/lib/api/types";

const SEARCH_TYPES = ["all", "projects", "influencer_requests", "influencers", "freelancers"] as const;
type SearchType = (typeof SEARCH_TYPES)[number];

function SelectField({ label, value, onChange, options, disabled, className }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className: string;
}) {
  return (
    <label className={`relative hidden h-[45px] items-center rounded-[5px] border border-border bg-surface xl:flex ${className}`}>
      <select
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className={`h-full w-full cursor-pointer appearance-none bg-transparent ps-2.5 pe-9 text-base outline-none disabled:cursor-default ${
          value ? "" : "text-placeholder"
        }`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-foreground">
            {option.label}
          </option>
        ))}
      </select>
      <Image
        src="/images/arrow-down-outline.svg"
        alt=""
        width={20}
        height={20}
        className="pointer-events-none absolute end-2.5 dark:invert"
      />
    </label>
  );
}

export function SearchBar({ countries }: { countries: Country[] }) {
  const t = useTranslations("Header");
  const router = useRouter();
  const typeRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<SearchType>("all");
  const [typeOpen, setTypeOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const closeType = useCallback(() => setTypeOpen(false), []);
  useDismiss(typeOpen, typeRef, closeType);

  const selectCountry = async (value: string) => {
    setCountryId(value);
    setCityId("");
    setCities([]);
    if (!value) return;
    const result = await api<{ data: City[] }>(`/countries/${value}/cities`).catch(() => ({ data: [] }));
    setCities(result.data);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (query.trim()) params.set("q", query.trim());
    if (countryId) params.set("countryId", countryId);
    if (cityId) params.set("cityId", cityId);
    router.push(`/search?${params}`);
  };

  return (
    <form role="search" onSubmit={submit} className="flex min-w-0 flex-1 gap-1 lg:flex-none">
      <div className="flex h-[45px] min-w-0 flex-1 items-center gap-[15px] rounded-[5px] border border-border bg-surface px-2.5 lg:w-[320px] lg:flex-none xl:w-[480px]">
        <div ref={typeRef} className="relative shrink-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={typeOpen}
            onClick={() => setTypeOpen((value) => !value)}
            className="flex items-center gap-1 text-base font-medium whitespace-nowrap"
          >
            {t(`searchTypes.${type}`)}
            <Image src="/images/arrow-down-dark.svg" alt="" width={20} height={20} className="dark:invert" />
          </button>
          {typeOpen && (
            <ul role="listbox" className="absolute start-0 top-full z-40 mt-3 w-44 rounded-md border border-border bg-surface py-1 shadow-card">
              {SEARCH_TYPES.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item === type}
                    onClick={() => {
                      setType(item);
                      setTypeOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-surface-muted ${item === type ? "bg-surface-muted font-bold" : ""}`}
                  >
                    {t(`searchTypes.${item}`)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="h-[19px] w-px bg-border" aria-hidden />
        <input
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          className="min-w-0 flex-1 bg-transparent text-base outline-none"
        />
        <button type="submit" aria-label={t("search")} className="shrink-0">
          <Image src="/images/search.svg" alt="" width={20} height={20} />
        </button>
      </div>

      <SelectField
        label={t("country")}
        value={countryId}
        onChange={selectCountry}
        className="w-[131px]"
        options={countries.map((country) => ({ value: String(country.id), label: country.name }))}
      />
      <SelectField
        label={t("city")}
        value={cityId}
        onChange={setCityId}
        disabled={!cities.length}
        className="w-[106px]"
        options={cities.map((city) => ({ value: String(city.id), label: city.name }))}
      />
    </form>
  );
}
