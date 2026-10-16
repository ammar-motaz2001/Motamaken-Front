"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Campaign, CampaignFilters } from "@/lib/api/types";
import { FilterFields } from "./CampaignForm";

/**
 * Change the filtering rules of a running or paused campaign.
 */
export function FilterSettings({ campaign }: { campaign: Campaign }) {
  const t = useTranslations("Campaigns.filters");
  const router = useRouter();
  const [filters, setFilters] = useState(campaign.filters);
  const [countries, setCountries] = useState(campaign.filters.allowed_countries.join(", "));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");

  const save = async () => {
    setState("busy");
    try {
      await api(`/campaigns/${campaign.id}`, {
        method: "PATCH",
        body: { filters: { ...filters, allowed_countries: countries.split(/[\s,]+/).map((code) => code.trim().toUpperCase()).filter(Boolean) } },
      });
      setErrors({});
      setState("saved");
      router.refresh();
    } catch (caught) {
      setErrors((caught as ApiError).fields);
      setState("idle");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterFields
        filters={filters}
        countries={countries}
        errors={errors}
        onFilter={(key, value) => (setFilters((current: CampaignFilters) => ({ ...current, [key]: value })), setState("idle"))}
        onCountries={(value) => (setCountries(value), setState("idle"))}
      />
      <div className="flex items-center justify-end gap-3">
        {state === "saved" && <span className="text-sm text-brand">{t("saved")}</span>}
        <Button variant="solid" font="button" loading={state === "busy"} onClick={save}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
