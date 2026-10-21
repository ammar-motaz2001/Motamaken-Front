"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { SiteSettings } from "../types";
import { SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

const NUMBERS = ["siteFeePercent", "depositMin", "depositMax", "withdrawalMin", "withdrawalFee"] as const;

/** Site fee, deposit and withdrawal limits and the KYC-before-withdrawal switch, saved with PUT /admin/settings. */
export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("Admin.settings");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [values, setValues] = useState(() => Object.fromEntries(NUMBERS.map((key) => [key, String(settings[key])])) as Record<(typeof NUMBERS)[number], string>);
  const [requiresKyc, setRequiresKyc] = useState(settings.withdrawalRequiresKyc);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void save("/admin/settings", "PUT", { ...Object.fromEntries(NUMBERS.map((key) => [key, Number(values[key])])), withdrawalRequiresKyc: requiresKyc });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {NUMBERS.map((key) => (
          <TextInput
            key={key}
            label={t(`fields.${key}`)}
            hint={t(`hints.${key}`)}
            type="number"
            step="0.01"
            required
            value={values[key]}
            error={fields[key]}
            onChange={(value) => setValues((current) => ({ ...current, [key]: value }))}
          />
        ))}
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
        <input type="checkbox" checked={requiresKyc} onChange={(event) => setRequiresKyc(event.target.checked)} className="mt-0.5 size-4 accent-brand" />
        <span>
          <span className="block font-medium">{t("fields.withdrawalRequiresKyc")}</span>
          <span className="text-muted">{t("hints.withdrawalRequiresKyc")}</span>
        </span>
      </label>
      <SaveBar busy={busy} error={error} saved={saved} />
    </form>
  );
}
