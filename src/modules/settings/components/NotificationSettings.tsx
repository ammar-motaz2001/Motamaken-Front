"use client";

import { Bell, CircleCheck, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { softSuccessClasses } from "@/components/ui/styles";
import { Switch } from "@/components/ui/Switch";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import { SettingsPanel } from "./SettingsPanel";

type Settings = { data: Record<string, boolean>; required: string[] };

/** Switches per notification group, saved with PATCH /me/notification-settings; required groups cannot be turned off. */
export function NotificationSettings({ initial, email }: { initial: Settings; email: string | null }) {
  const t = useTranslations("Settings.notifications");
  const [values, setValues] = useState(initial.data);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const body = Object.fromEntries(Object.entries(values).filter(([group]) => !initial.required.includes(group)));
      const result = await api<Settings>("/me/notification-settings", { method: "PATCH", body });
      setValues(result.data);
      setSaved(true);
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
      <p className="flex items-center gap-2 rounded-lg bg-surface-muted p-3 text-sm">
        <Mail className="size-4 shrink-0 text-muted" aria-hidden />
        {email ? t("sentTo", { email }) : t("noEmail")}
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[460px] text-sm">
          <thead className="bg-surface-muted text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5 text-start font-medium">{t("type")}</th>
              <th className="px-3 py-2.5 text-center font-medium">
                <span className="inline-flex items-center gap-1">
                  <Bell className="size-3.5" />
                  {t("bell")}
                </span>
              </th>
              <th className="px-3 py-2.5 text-center font-medium">
                <span className="inline-flex items-center gap-1">
                  <Mail className="size-3.5" />
                  {t("email")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(values).map((group) => {
              const required = initial.required.includes(group);
              return (
                <tr key={group} className="border-t border-border">
                  <td className="px-3 py-3">
                    <p className="font-medium">{t(`groups.${group}.title`)}</p>
                    <p className="text-xs text-muted">{t(`groups.${group}.text`)}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <CircleCheck className="mx-auto size-5 text-brand" aria-label={t("always")} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <Switch
                        checked={values[group]}
                        disabled={required || !email}
                        label={t("emailFor", { group: t(`groups.${group}.title`) })}
                        onChange={(checked) => (setValues((current) => ({ ...current, [group]: checked })), setSaved(false))}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{t("requiredNote")}</p>
      {error && <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p>}
      {saved && (
        <p role="status" className={`${softSuccessClasses} flex items-center gap-2 p-3 text-sm text-brand`}>
          <CircleCheck className="size-4" />
          {t("saved")}
        </p>
      )}
      <Button variant="solid" font="button" loading={busy} onClick={save} className="self-end">
        {t("save")}
      </Button>
    </SettingsPanel>
  );
}
