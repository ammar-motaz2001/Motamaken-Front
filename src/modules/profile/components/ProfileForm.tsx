"use client";

import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { panelClasses, softSuccessClasses } from "@/components/ui/styles";
import { TextArea } from "@/components/ui/TextArea";
import { useCities } from "@/components/ui/useCities";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError, FieldErrors } from "@/lib/api/errors";
import type { Country, Profile } from "@/lib/api/types";

type Form = { type: string; jobTitle: string; bio: string; countryId: string; cityId: string };

/** Public profile basics: freelancer or influencer, job title, bio, country and city, saved with PUT /me/profile. */
export function ProfileForm({ profile, countries }: { profile: Profile | null; countries: Country[] }) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const [form, setForm] = useState<Form>({
    type: profile?.type ?? "freelancer",
    jobTitle: profile?.jobTitle ?? "",
    bio: profile?.bio ?? "",
    countryId: profile?.countryId ? String(profile.countryId) : "",
    cityId: profile?.cityId ? String(profile.cityId) : "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const cities = useCities(form.countryId);

  const update = (key: keyof Form, value: string) => {
    setForm((current) => ({ ...current, [key]: value, ...(key === "countryId" ? { cityId: "" } : {}) }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setSaved(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.jobTitle.trim().length < 2) {
      setErrors({ jobTitle: t("jobTitleRequired") });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api("/me/profile", {
        method: "PUT",
        body: {
          type: form.type,
          jobTitle: form.jobTitle.trim(),
          bio: form.bio.trim() || null,
          countryId: form.countryId ? Number(form.countryId) : null,
          cityId: form.cityId ? Number(form.cityId) : null,
        },
      });
      setSaved(true);
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError(apiError.message || t("failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={`${panelClasses} mx-auto flex w-full max-w-[760px] flex-col gap-5`}>
      <PageHeader
        crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]}
        title={profile ? t("title") : t("addTitle")}
        subtitle={t("subtitle")}
      />

      {profile && (
        <div className="flex flex-wrap gap-6 text-sm text-muted">
          <span>{t("rating", { rating: profile.rating, count: profile.reviewsCount })}</span>
          {profile.isFeatured && <span className="font-bold text-brand">{t("featured")}</span>}
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-base font-medium">{t("type")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["freelancer", "influencer"] as const).map((type) => (
            <label
              key={type}
              className={`flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 ${form.type === type ? "border-brand bg-brand-soft" : "border-border"}`}
            >
              <span className="flex items-center gap-2 font-bold">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={form.type === type}
                  onChange={() => update("type", type)}
                  className="accent-brand"
                />
                {t(`types.${type}.title`)}
              </span>
              <span className="text-sm text-muted">{t(`types.${type}.text`)}</span>
            </label>
          ))}
        </div>
        {errors.type && <p className="text-xs text-danger">{errors.type}</p>}
      </fieldset>

      <Field
        label={t("jobTitle")}
        required
        maxLength={80}
        placeholder={t("jobTitlePlaceholder")}
        value={form.jobTitle}
        error={errors.jobTitle}
        onChange={(event) => update("jobTitle", event.target.value)}
      />
      <TextArea
        label={t("bio")}
        rows={5}
        maxLength={2000}
        placeholder={t("bioPlaceholder")}
        value={form.bio}
        error={errors.bio}
        onChange={(event) => update("bio", event.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t("country")}
          value={form.countryId}
          error={errors.countryId}
          options={[{ value: "", label: t("none") }, ...countries.map((item) => ({ value: String(item.id), label: item.name }))]}
          onChange={(event) => update("countryId", event.target.value)}
        />
        <Select
          label={t("city")}
          value={form.cityId}
          error={errors.cityId}
          disabled={!cities.length}
          options={[{ value: "", label: t("none") }, ...cities.map((item) => ({ value: String(item.id), label: item.name }))]}
          onChange={(event) => update("cityId", event.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className={`${softSuccessClasses} flex items-center gap-2 p-3 text-sm text-brand`}>
          <CircleCheck className="size-4" />
          {t("saved")}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="solid" pill loading={saving}>
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
