import type { Project } from "@/lib/api/types";

export const STEPS = ["details", "budget", "publish"] as const;
type StepKey = (typeof STEPS)[number];

export type ProjectForm = {
  categoryId: string;
  title: string;
  description: string;
  budgetMin: string;
  budgetMax: string;
  currency: string;
  countryId: string;
  cityId: string;
};

export type FormErrors = Partial<Record<keyof ProjectForm, string>>;

const STEP_FIELDS: Record<Exclude<StepKey, "publish">, (keyof ProjectForm)[]> = {
  details: ["categoryId", "title", "description"],
  budget: ["budgetMin", "budgetMax", "currency", "countryId", "cityId"],
};

export const EMPTY_FORM: ProjectForm = {
  categoryId: "",
  title: "",
  description: "",
  budgetMin: "",
  budgetMax: "",
  currency: "USD",
  countryId: "",
  cityId: "",
};

/** Wizard values from an existing project, for the edit screen. */
export function formFromProject(project: Project, countryId: string, cityId: string): ProjectForm {
  return {
    categoryId: String(project.category.id),
    title: project.title,
    description: project.description,
    budgetMin: String(project.budget.min),
    budgetMax: String(project.budget.max),
    currency: project.budget.currency,
    countryId,
    cityId,
  };
}

type Translate = (key: string, values?: Record<string, number>) => string;

/** Errors of one wizard step: category, title and description on "details"; budget range and currency on "budget". */
export function validateStep(step: StepKey, form: ProjectForm, t: Translate): FormErrors {
  if (step === "details") {
    return {
      categoryId: form.categoryId ? undefined : t("required"),
      title: form.title.trim().length < 5 ? t("minLength", { min: 5 }) : undefined,
      description: form.description.trim().length < 20 ? t("minLength", { min: 20 }) : undefined,
    };
  }
  if (step === "budget") {
    const min = Number(form.budgetMin);
    const max = Number(form.budgetMax);
    return {
      budgetMin: !form.budgetMin ? t("required") : min < 1 ? t("budgetInvalid") : undefined,
      budgetMax: !form.budgetMax ? t("required") : max < min ? t("budgetRange") : undefined,
    };
  }
  return {};
}

/** True when any wizard field has an error. */
export function hasErrors(errors: FormErrors) {
  return Object.values(errors).some(Boolean);
}

/** Wizard step that holds a field, so an API error can send the user back to it. */
export function stepOfField(field: string): StepKey {
  return STEP_FIELDS.details.includes(field as keyof ProjectForm) ? "details" : "budget";
}

/** Wizard values as the projects API expects them: numbers for ids and budget, trimmed text, null for no location. */
export function toPayload(form: ProjectForm) {
  return {
    categoryId: Number(form.categoryId),
    title: form.title.trim(),
    description: form.description.trim(),
    budgetMin: Number(form.budgetMin),
    budgetMax: Number(form.budgetMax),
    currency: form.currency,
    countryId: form.countryId ? Number(form.countryId) : null,
    cityId: form.cityId ? Number(form.cityId) : null,
  };
}
