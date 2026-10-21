"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/Field";
import { ResultModal } from "@/components/ui/ResultModal";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import { PasswordStrength } from "@/modules/auth/components/PasswordStrength";
import { hasErrors, validatePassword, validatePasswordConfirmation } from "@/modules/auth/lib/validation";
import { SettingsPanel } from "./SettingsPanel";

/** Change password: current, new and confirmation, checked here and sent to POST /me/password. */
export function PasswordSettings() {
  const t = useTranslations("Settings.password");
  const v = useTranslations("Validation");
  const [form, setForm] = useState({ current: "", password: "", confirmation: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) => (setForm((current) => ({ ...current, [key]: value })), setErrors({}));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const weak = validatePassword(form.password);
    const mismatch = validatePasswordConfirmation(form.password, form.confirmation);
    const found = {
      current: form.current ? undefined : t("currentRequired"),
      password: weak ? v(weak) : undefined,
      confirmation: mismatch ? v(mismatch) : undefined,
    };
    setErrors(found);
    if (hasErrors(found)) return;

    setBusy(true);
    setError(null);
    try {
      await api("/me/password", { method: "POST", body: { currentPassword: form.current, password: form.password, password_confirmation: form.confirmation } });
      setForm({ current: "", password: "", confirmation: "" });
      setDone(true);
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors({ current: apiError.fields.currentPassword, password: apiError.fields.password });
      if (!Object.keys(apiError.fields).length) setError(apiError.message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-4">
        <PasswordField label={t("current")} required autoComplete="current-password" value={form.current} error={errors.current} onChange={(event) => set("current", event.target.value)} />
        <PasswordField label={t("new")} required autoComplete="new-password" value={form.password} error={errors.password} onChange={(event) => set("password", event.target.value)} />
        {form.password && <PasswordStrength password={form.password} />}
        <PasswordField label={t("confirm")} required autoComplete="new-password" value={form.confirmation} error={errors.confirmation} onChange={(event) => set("confirmation", event.target.value)} />
        {error && <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p>}
        <Button type="submit" variant="solid" font="button" loading={busy} className="self-end">
          {t("save")}
        </Button>
      </form>
      <ResultModal open={done} onClose={() => setDone(false)} type="success" message={t("done")}>
        <Button variant="primary" font="button" width={260} onClick={() => setDone(false)}>
          {t("close")}
        </Button>
      </ResultModal>
    </SettingsPanel>
  );
}
