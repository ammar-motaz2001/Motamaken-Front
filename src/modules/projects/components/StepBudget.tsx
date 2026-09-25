"use client";

import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import type { BudgetErrors } from "../lib/validation";
import type { ProjectBudget } from "../types";
import { hintClasses, sectionTitleClasses } from "./styles";

type StepBudgetProps = {
  budget: ProjectBudget;
  errors: BudgetErrors;
  onChange: (budget: ProjectBudget) => void;
};

export function StepBudget({ budget, errors, onChange }: StepBudgetProps) {
  const t = useTranslations("Projects.budget");
  const update = (key: keyof ProjectBudget, value: string) => onChange({ ...budget, [key]: value });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className={sectionTitleClasses}>{t("heading")}</h2>
        <p className={hintClasses}>{t("hint")}</p>
      </div>
      <Field
        label={t("projectTitle")}
        required
        placeholder={t("projectTitlePlaceholder")}
        value={budget.title}
        error={errors.title}
        onChange={(event) => update("title", event.target.value)}
      />
      <TextArea
        label={t("description")}
        required
        placeholder={t("descriptionPlaceholder")}
        value={budget.description}
        error={errors.description}
        onChange={(event) => update("description", event.target.value)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={t("amount")}
          required
          type="number"
          min={10}
          inputMode="numeric"
          placeholder={t("amountPlaceholder")}
          value={budget.amount}
          error={errors.amount}
          onChange={(event) => update("amount", event.target.value)}
        />
        <Field
          label={t("duration")}
          required
          type="number"
          min={1}
          max={365}
          inputMode="numeric"
          placeholder={t("durationPlaceholder")}
          value={budget.duration}
          error={errors.duration}
          onChange={(event) => update("duration", event.target.value)}
        />
      </div>
    </div>
  );
}
