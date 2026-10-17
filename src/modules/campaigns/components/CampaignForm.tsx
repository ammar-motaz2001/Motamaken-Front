"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { TextArea } from "@/components/ui/TextArea";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import { DateField } from "@/components/ui/DatePicker";
import type { Campaign, CampaignFilters, Paginated, Project } from "@/lib/api/types";

const PLATFORM_FEE = 20;
const CURRENCIES = ["USD", "SAR", "AED", "EUR"];

type Form = {
  title: string;
  description: string;
  targetType: "project" | "profile";
  targetId: string;
  currency: string;
  budget: string;
  costPerVisit: string;
  endsAt: string;
  filters: CampaignFilters;
};

const DEFAULT_FILTERS: CampaignFilters = { block_bots: true, unique_window_hours: 24, max_visits_per_promoter_per_hour: 100, allowed_countries: [] };

/**
 * Create a campaign (no `campaign`) or edit a draft. Saved as a draft; launching is a separate step on the detail page.
 */
export function CampaignForm({ campaign, currency, hasProfile }: { campaign?: Campaign; currency: string; hasProfile: boolean }) {
  const t = useTranslations("Campaigns");
  const locale = useLocale();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<Form>({
    title: campaign?.title ?? "",
    description: campaign?.description ?? "",
    targetType: campaign?.target.type ?? "project",
    targetId: campaign ? String(campaign.target.id) : "",
    currency: campaign?.currency ?? (CURRENCIES.includes(currency) ? currency : "USD"),
    budget: campaign ? String(campaign.budget) : "",
    costPerVisit: campaign ? String(campaign.costPerVisit) : "",
    endsAt: campaign?.endsAt?.slice(0, 10) ?? "",
    filters: campaign?.filters ?? DEFAULT_FILTERS,
  });
  const [countries, setCountries] = useState((campaign?.filters.allowed_countries ?? []).join(", "));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (campaign) return;
    api<Paginated<Project>>("/me/projects?status=open&perPage=50").then(({ data }) => setProjects(data)).catch(() => setProjects([]));
  }, [campaign]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => (setForm((current) => ({ ...current, [key]: value })), setErrors({}));
  const setFilter = <K extends keyof CampaignFilters>(key: K, value: CampaignFilters[K]) => set("filters", { ...form.filters, [key]: value });

  const money = (amount: number) => new Intl.NumberFormat(locale, { style: "currency", currency: form.currency, maximumFractionDigits: 2 }).format(amount);
  const estimate = useMemo(() => {
    const budget = Number(form.budget);
    const cost = Number(form.costPerVisit);
    if (!(budget > 0 && cost > 0)) return null;
    return { visits: Math.floor(budget / cost), reward: cost - Math.round(cost * PLATFORM_FEE) / 100 };
  }, [form.budget, form.costPerVisit]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const filters = {
      ...form.filters,
      allowed_countries: countries.split(/[\s,]+/).map((code) => code.trim().toUpperCase()).filter(Boolean),
    };
    const shared = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      budget: Number(form.budget),
      costPerVisit: Number(form.costPerVisit),
      endsAt: form.endsAt || null,
      filters,
    };

    try {
      const { data } = campaign
        ? await api<{ data: Campaign }>(`/campaigns/${campaign.id}`, { method: "PATCH", body: shared })
        : await api<{ data: Campaign }>("/campaigns", {
            method: "POST",
            body: { ...shared, targetType: form.targetType, targetId: form.targetType === "project" ? Number(form.targetId) || null : null, currency: form.currency },
          });
      router.push(`/settings/campaigns/${data.id}`);
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError(Object.keys(apiError.fields).length ? null : apiError.message || t("form.failed"));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <p className="rounded-lg bg-surface-muted p-3 text-sm text-muted">{t("form.intro")}</p>

      <Field label={t("form.title")} required placeholder={t("form.titlePlaceholder")} value={form.title} error={errors.title} onChange={(event) => set("title", event.target.value)} />
      <TextArea label={t("form.description")} placeholder={t("form.descriptionPlaceholder")} rows={3} value={form.description} error={errors.description} onChange={(event) => set("description", event.target.value)} />

      {!campaign && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t("form.targetType")}
            required
            value={form.targetType}
            options={[
              { value: "project", label: t("form.project") },
              ...(hasProfile ? [{ value: "profile", label: t("target.profile") }] : []),
            ]}
            onChange={(event) => set("targetType", event.target.value as Form["targetType"])}
          />
          {form.targetType === "project" &&
            (projects.length ? (
              <Select
                label={t("form.chooseProject")}
                required
                placeholder={t("form.chooseProject")}
                value={form.targetId}
                error={errors.targetId}
                options={projects.map((project) => ({ value: String(project.id), label: project.title }))}
                onChange={(event) => set("targetId", event.target.value)}
              />
            ) : (
              <p className="self-end text-sm text-orange">{t("form.noProjects")}</p>
            ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {!campaign && (
          <Select label={t("form.currency")} required value={form.currency} options={CURRENCIES.map((code) => ({ value: code, label: code }))} onChange={(event) => set("currency", event.target.value)} />
        )}
        <Field label={t("form.budget")} required type="number" min={1} step="0.01" inputMode="decimal" dir="ltr" value={form.budget} error={errors.budget} disabled={campaign && campaign.status !== "draft"} onChange={(event) => set("budget", event.target.value)} />
        <Field label={t("form.costPerVisit")} required type="number" min={0.01} step="0.01" inputMode="decimal" dir="ltr" value={form.costPerVisit} error={errors.costPerVisit} disabled={campaign && campaign.status !== "draft"} onChange={(event) => set("costPerVisit", event.target.value)} />
      </div>
      {estimate && <p className="-mt-2 text-sm text-brand">{t("form.estimate", { visits: estimate.visits, reward: money(estimate.reward), fee: PLATFORM_FEE })}</p>}

      <DateField label={t("form.endsAt")} value={form.endsAt} error={errors.endsAt} onChange={(value) => set("endsAt", value)} min={new Date().toISOString().slice(0, 10)} className="sm:max-w-xs" />

      <fieldset className="flex flex-col gap-4 rounded-xl border border-border p-4">
        <legend className="px-1 font-bold">{t("form.filtersTitle")}</legend>
        <p className="text-sm text-muted">{t("form.filtersHint")}</p>
        <FilterFields filters={form.filters} countries={countries} errors={errors} onFilter={setFilter} onCountries={setCountries} />
      </fieldset>

      {error && <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p>}
      <Button type="submit" variant="solid" font="button" loading={busy} className="self-end">
        {campaign ? t("form.save") : t("form.create")}
      </Button>
    </form>
  );
}

/**
 * The filtering rules, shared by the creation form and the "Visit filtering" panel of a running campaign.
 */
export function FilterFields({
  filters,
  countries,
  errors,
  onFilter,
  onCountries,
}: {
  filters: CampaignFilters;
  countries: string;
  errors: Record<string, string | undefined>;
  onFilter: <K extends keyof CampaignFilters>(key: K, value: CampaignFilters[K]) => void;
  onCountries: (value: string) => void;
}) {
  const t = useTranslations("Campaigns.filters");

  return (
    <>
      <label className="flex items-center justify-between gap-4 text-sm">
        {t("blockBots")}
        <Switch checked={filters.block_bots} label={t("blockBots")} onChange={(value) => onFilter("block_bots", value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("window")} type="number" min={1} max={720} dir="ltr" value={String(filters.unique_window_hours)} error={errors["filters.unique_window_hours"]} onChange={(event) => onFilter("unique_window_hours", Number(event.target.value))} />
        <Field label={t("perHour")} type="number" min={1} max={10000} dir="ltr" value={String(filters.max_visits_per_promoter_per_hour)} error={errors["filters.max_visits_per_promoter_per_hour"]} onChange={(event) => onFilter("max_visits_per_promoter_per_hour", Number(event.target.value))} />
      </div>
      <Field label={t("countries")} hint={t("countriesHint")} placeholder="EG, SA, AE" dir="ltr" value={countries} error={errors["filters.allowed_countries.0"] ?? errors["filters.allowed_countries"]} onChange={(event) => onCountries(event.target.value)} />
    </>
  );
}
