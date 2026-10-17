"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { KycSubmission } from "@/lib/api/types";
import { DateField } from "@/components/ui/DatePicker";
import { FilePick } from "./FilePick";

const DOCUMENTS = ["national_id", "passport", "driver_license"] as const;
const MAX = 10 * 1024 * 1024;

type Form = { documentType: string; documentNumber: string; fullName: string; dateOfBirth: string };
type Files = { front: File | null; back: File | null; selfie: File | null };

// An adult today at the latest, so the calendar opens on a plausible year.
const adultMax = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().slice(0, 10);

export function KycForm({ defaultName, onSubmitted }: { defaultName: string; onSubmitted: (submission: KycSubmission) => void }) {
  const t = useTranslations("Verification.form");
  const [form, setForm] = useState<Form>({ documentType: "national_id", documentNumber: "", fullName: defaultName, dateOfBirth: "" });
  const [files, setFiles] = useState<Files>({ front: null, back: null, selfie: null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof Form, value: string) => (setForm((current) => ({ ...current, [key]: value })), setErrors({}));
  const pick = (key: keyof Files, file: File | null) => {
    setErrors({});
    if (file && file.size > MAX) return setErrors({ [key]: t("errors.size") });
    setFiles((current) => ({ ...current, [key]: file }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> = {};
    const adult = new Date();
    adult.setFullYear(adult.getFullYear() - 18);
    if (form.documentNumber.trim().length < 4) found.documentNumber = t("errors.documentNumber");
    if (form.fullName.trim().length < 3) found.fullName = t("errors.fullName");
    if (!form.dateOfBirth) found.dateOfBirth = t("errors.dateOfBirth");
    else if (new Date(form.dateOfBirth) > adult) found.dateOfBirth = t("errors.adult");
    if (!files.front) found.front = t("errors.front");
    if (!files.selfie) found.selfie = t("errors.selfie");
    setErrors(found);
    if (Object.keys(found).length) return;

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value.trim()));
    (Object.entries(files) as [keyof Files, File | null][]).forEach(([key, file]) => file && body.append(key, file));

    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: KycSubmission }>("/me/kyc", { method: "POST", body });
      onSubmitted(data);
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError(Object.keys(apiError.fields).length ? null : apiError.message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t("documentType")}
          required
          value={form.documentType}
          options={DOCUMENTS.map((value) => ({ value, label: t(`documents.${value}`) }))}
          onChange={(event) => set("documentType", event.target.value)}
        />
        <Field label={t("documentNumber")} required dir="ltr" value={form.documentNumber} error={errors.documentNumber} onChange={(event) => set("documentNumber", event.target.value)} />
        <Field label={t("fullName")} required hint={t("fullNameHint")} value={form.fullName} error={errors.fullName} onChange={(event) => set("fullName", event.target.value)} />
        <DateField label={t("dateOfBirth")} required value={form.dateOfBirth} error={errors.dateOfBirth} onChange={(value) => set("dateOfBirth", value)} min="1920-01-01" max={adultMax} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FilePick label={t("front")} hint={t("fileHint")} accept="image/jpeg,image/png,image/webp,application/pdf" required file={files.front} error={errors.front} onChange={(file) => pick("front", file)} />
        <FilePick label={t("back")} hint={t("fileHint")} accept="image/jpeg,image/png,image/webp,application/pdf" file={files.back} error={errors.back} onChange={(file) => pick("back", file)} />
        <FilePick label={t("selfie")} hint={t("selfieHint")} accept="image/jpeg,image/png,image/webp" required file={files.selfie} error={errors.selfie} onChange={(file) => pick("selfie", file)} />
      </div>
      <p className="text-xs text-muted">{t("privacy")}</p>
      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" variant="solid" font="button" loading={busy} className="self-end">
        {t("submit")}
      </Button>
    </form>
  );
}
