"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import { useDraft } from "@/lib/draft";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { dividerClasses, hintClasses, outlinedPanelClasses, panelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { TextArea } from "@/components/ui/TextArea";
import { useCities } from "@/components/ui/useCities";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Category, Country, Currency, Project, ProjectType } from "@/lib/api/types";
import { formatAmount } from "@/lib/format";
import {
  EMPTY_FORM,
  hasErrors,
  STEPS,
  stepOfField,
  toPayload,
  validateStep,
  type FormErrors,
  type ProjectForm,
} from "../lib/form";
import { Stepper } from "./Stepper";

type ProjectWizardProps = {
  type: ProjectType;
  categories: Category[];
  currencies: Currency[];
  countries: Country[];
  project?: Project;
  initial?: ProjectForm;
  initialCityName?: string | null;
};

/**
 * Step-by-step form to post or edit a project or influencer request. New ones are kept as a draft on the device;
 * guests sign up only when publishing (POST /projects, or PATCH /projects/{id} when editing).
 */
export function ProjectWizard({ type, categories, currencies, countries, project, initial, initialCityName }: ProjectWizardProps) {
  const t = useTranslations("Projects");
  const tv = useTranslations("Projects.validation");
  const locale = useLocale();
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  // A new project is kept as a draft while it is being written (also by guests, who sign up only when publishing).
  const draftKey = project ? null : `project-${type}`;
  const [stepIndex, setStepIndex, clearStep] = useDraft(draftKey && `${draftKey}-step`, 0);
  const [form, setForm, clearDraft] = useDraft<ProjectForm>(draftKey, initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState<Project | null>(null);
  const cities = useCities(form.countryId);
  const editing = Boolean(project);
  // A saved draft is edited here too: it can be saved again as a draft or published.
  const editingDraft = project?.status === "draft";
  const kind = type === "project" ? "project" : "request";

  const cityId = form.cityId || (initialCityName ? String(cities.find((city) => city.name === initialCityName)?.id ?? "") : "");
  const step = STEPS[stepIndex];
  const options = categories.filter((category) => category.type === (type === "project" ? "project" : "influencer"));
  const category = options.find((item) => String(item.id) === form.categoryId);
  const country = countries.find((item) => String(item.id) === form.countryId);
  const city = cities.find((item) => String(item.id) === cityId);

  const update = (key: keyof ProjectForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value, ...(key === "countryId" ? { cityId: "" } : {}) }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const goTo = (index: number) => {
    setStepIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (asDraft = false) => {
    // The deciding moment: a guest confirms an email or phone here and publishing simply carries on.
    if (!(await requireAuth(t(`publish.signUpReason.${kind}`)))) return;
    setSaving(true);
    setFormError(null);
    const payload = toPayload({ ...form, cityId });
    try {
      let { data } = project
        ? await api<{ data: Project }>(`/projects/${project.id}`, { method: "PATCH", body: payload })
        : await api<{ data: Project }>("/projects", { method: "POST", body: { ...payload, type, draft: asDraft } });
      if (editingDraft && !asDraft) data = (await api<{ data: Project }>(`/projects/${data.id}/publish`, { method: "POST" })).data;
      if (project) {
        router.push(`/projects/${data.id}`);
        router.refresh();
      } else {
        clearDraft();
        clearStep();
        setPublished(data);
        // The confirmation replaces the form at the top of the page: bring it into view.
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (caught) {
      const error = caught as ApiError;
      const fields = Object.keys(error.fields);
      if (fields.length) {
        setErrors(error.fields as FormErrors);
        goTo(STEPS.indexOf(stepOfField(fields[0])));
      }
      setFormError(error.message || t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    const stepErrors = validateStep(step, form, tv);
    setErrors(stepErrors);
    if (hasErrors(stepErrors)) return;
    if (step === "publish") submit();
    else goTo(stepIndex + 1);
  };

  if (published) {
    return (
      <section className={`${panelClasses} flex flex-col items-center gap-4 py-16 text-center`}>
        <StatusIcon type="success" size={96} />
        <h1 className="text-2xl font-bold text-brand">{published.status === "draft" ? t("publish.draftTitle") : t(`publish.publishedTitle.${kind}`)}</h1>
        <p className="text-muted">{published.status === "draft" ? t("publish.draftText") : t("publish.publishedText")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href={`/projects/${published.id}`} variant="solid" pill>
            {t("publish.viewProject")}
          </Button>
          <Button href="/my-projects" variant="ghost" pill>
            {t("publish.myProjects")}
          </Button>
        </div>
      </section>
    );
  }

  const nextLabel =
    step === "publish"
      ? t(editing && !editingDraft ? "actions.save" : "actions.publish")
      : STEPS[stepIndex + 1] === "publish"
        ? t("actions.review")
        : t("actions.next");

  const reviewRows = [
    { label: t(`fields.categoryLabel.${kind}`), value: category?.name ?? "" },
    { label: t("fields.title"), value: form.title },
    {
      label: t("fields.budget"),
      value: form.budgetMin
        ? `${formatAmount(Number(form.budgetMin), form.currency, locale)} - ${formatAmount(Number(form.budgetMax), form.currency, locale)}`
        : "",
    },
    {
      label: t("fields.location"),
      value: country
        ? new Intl.ListFormat(locale, { type: "unit" }).format([city?.name, country.name].filter((name): name is string => Boolean(name)))
        : t("publish.anywhere"),
    },
  ];

  return (
    <section className={`${panelClasses} flex flex-col gap-6`}>
      <PageHeader
        crumbs={[
          { label: t("breadcrumb.home"), href: "/" },
          editing && project ? { label: project.title, href: `/projects/${project.id}` } : { label: t("breadcrumb.add") },
          { label: t(editing ? "breadcrumb.edit" : `breadcrumb.new.${kind}`) },
        ]}
        title={t(editing ? "editTitle" : `title.${kind}`)}
        subtitle={t("subtitle")}
      />

      <Stepper steps={STEPS} current={stepIndex} />

      <div className={`${dividerClasses} flex flex-col gap-5 pt-6`}>
        {step === "details" && (
          <>
            <div>
              <h2 className={sectionTitleClasses}>{t("details.heading")}</h2>
              <p className={hintClasses}>{t(`details.hint.${kind}`)}</p>
            </div>
            <Select
              label={t(`fields.categoryLabel.${kind}`)}
              required
              placeholder={t("fields.categoryPlaceholder")}
              value={form.categoryId}
              error={errors.categoryId}
              options={options.map((item) => ({ value: String(item.id), label: item.name }))}
              onChange={(event) => update("categoryId", event.target.value)}
            />
            <Field
              label={t("fields.title")}
              required
              maxLength={150}
              placeholder={t(`fields.titlePlaceholder.${kind}`)}
              value={form.title}
              error={errors.title}
              onChange={(event) => update("title", event.target.value)}
            />
            <TextArea
              label={t("fields.description")}
              required
              rows={6}
              maxLength={5000}
              placeholder={t("fields.descriptionPlaceholder")}
              value={form.description}
              error={errors.description}
              hint={t("fields.descriptionHint", { count: form.description.trim().length })}
              hintTone={form.description.trim().length < 20 ? "danger" : "success"}
              onChange={(event) => update("description", event.target.value)}
            />
          </>
        )}

        {step === "budget" && (
          <>
            <div>
              <h2 className={sectionTitleClasses}>{t("budget.heading")}</h2>
              <p className={hintClasses}>{t("budget.hint")}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label={t("fields.budgetMin")}
                required
                type="number"
                min={1}
                inputMode="numeric"
                value={form.budgetMin}
                error={errors.budgetMin}
                onChange={(event) => update("budgetMin", event.target.value)}
              />
              <Field
                label={t("fields.budgetMax")}
                required
                type="number"
                min={1}
                inputMode="numeric"
                value={form.budgetMax}
                error={errors.budgetMax}
                onChange={(event) => update("budgetMax", event.target.value)}
              />
              <Select
                label={t("fields.currency")}
                value={form.currency}
                error={errors.currency}
                options={currencies.map((item) => ({ value: item.code, label: `${item.code} · ${item.name}` }))}
                onChange={(event) => update("currency", event.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={t("fields.country")}
                value={form.countryId}
                error={errors.countryId}
                options={[{ value: "", label: t("publish.anywhere") }, ...countries.map((item) => ({ value: String(item.id), label: item.name }))]}
                onChange={(event) => update("countryId", event.target.value)}
              />
              <Select
                label={t("fields.city")}
                value={cityId}
                error={errors.cityId}
                disabled={!cities.length}
                options={[{ value: "", label: t("fields.anyCity") }, ...cities.map((item) => ({ value: String(item.id), label: item.name }))]}
                onChange={(event) => update("cityId", event.target.value)}
              />
            </div>
          </>
        )}

        {step === "publish" && (
          <>
            <div>
              <h2 className={sectionTitleClasses}>{t("publish.heading")}</h2>
              <p className={hintClasses}>{t(`publish.hintFor.${kind}`)}</p>
            </div>
            <dl className={`${outlinedPanelClasses} grid gap-x-8 gap-y-3 sm:grid-cols-[180px_1fr]`}>
              {reviewRows.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-sm text-muted">{row.label}</dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="rounded-lg bg-surface-muted p-4 text-sm leading-relaxed whitespace-pre-line">{form.description}</p>
          </>
        )}

        {formError && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {formError}
          </p>
        )}
      </div>

      <div className={`${dividerClasses} flex flex-wrap items-center justify-between gap-3 pt-5`}>
        {stepIndex === 0 ? (
          <Button variant="ghost" pill href={project ? `/projects/${project.id}` : "/"}>
            {t("actions.cancel")}
          </Button>
        ) : (
          <Button variant="ghost" pill onClick={() => goTo(stepIndex - 1)}>
            {t("actions.back")}
          </Button>
        )}
        <div className="flex flex-wrap gap-2">
          {step === "publish" && (!editing || editingDraft) && (
            <Button variant="outline" pill onClick={() => submit(true)} disabled={saving}>
              {t("actions.saveDraft")}
            </Button>
          )}
          <Button variant="solid" pill onClick={next} loading={saving}>
            {nextLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
