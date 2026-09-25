"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { CATEGORIES, EXTRAS } from "../lib/data";
import type { CategoryKey, ExtraKey, ProjectDetails, ProjectMode } from "../types";
import { ModeCard } from "./ModeCard";
import { dividerClasses, hintClasses } from "./styles";

type StepDetailsProps = {
  details: ProjectDetails;
  errors: Partial<Record<"category" | "subcategory", string>>;
  mode: ProjectMode;
  onChange: (details: ProjectDetails) => void;
  onSelectMode: (mode: ProjectMode) => void;
};

export function StepDetails({ details, errors, mode, onChange, onSelectMode }: StepDetailsProps) {
  const t = useTranslations("Projects");
  const subcategories = details.category ? CATEGORIES[details.category] : [];

  const toggleExtra = (extra: ExtraKey, checked: boolean) =>
    onChange({
      ...details,
      extras: checked ? [...details.extras, extra] : details.extras.filter((item) => item !== extra),
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t("category")}
          required
          placeholder={t("categoryPlaceholder")}
          value={details.category}
          error={errors.category}
          options={(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => ({ value: key, label: t(`categories.${key}`) }))}
          onChange={(event) => onChange({ ...details, category: event.target.value as CategoryKey, subcategory: "" })}
        />
        <Select
          label={t("subcategory")}
          required
          placeholder={t("subcategoryPlaceholder")}
          value={details.subcategory}
          error={errors.subcategory}
          disabled={!details.category}
          options={subcategories.map((key) => ({ value: key, label: t(`subcategories.${key}`) }))}
          onChange={(event) => onChange({ ...details, subcategory: event.target.value })}
        />
      </div>

      <div className={`${dividerClasses} flex flex-col gap-4 pt-6`}>
        <div>
          <p className="text-base font-bold">
            {t("whoExecutes")} <span className="text-danger">*</span>
          </p>
          <p className={hintClasses}>{t("whoExecutesHint")}</p>
        </div>
        <div role="radiogroup" className="grid items-start gap-4 md:grid-cols-2">
          <ModeCard mode="individual" selected={mode === "individual"} onSelect={() => onSelectMode("individual")} />
          <ModeCard mode="team" selected={mode === "team"} onSelect={() => onSelectMode("team")} />
        </div>
      </div>

      <div className={`${dividerClasses} flex flex-col gap-2 pt-6`}>
        <p className="text-base font-bold">{t("extras")}</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {EXTRAS.map((extra) => (
            <Checkbox
              key={extra}
              checked={details.extras.includes(extra)}
              onChange={(event) => toggleExtra(extra, event.target.checked)}
            >
              {t(`extrasOptions.${extra}`)}
            </Checkbox>
          ))}
        </div>
      </div>
    </div>
  );
}
