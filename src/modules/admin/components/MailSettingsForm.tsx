"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Listbox } from "@/components/ui/Listbox";
import { api } from "@/lib/api/client";
import type { MailSettings } from "../types";
import { SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

/** The SMTP server used for every email, with a test button that shows the server's error right here. */
export function MailSettingsForm({ settings }: { settings: MailSettings }) {
  const t = useTranslations("Admin.mail");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [enabled, setEnabled] = useState(settings.overridden);
  const [draft, setDraft] = useState({
    host: settings.host ?? "",
    port: String(settings.port || 587),
    username: settings.username ?? "",
    mailPassword: "",
    scheme: settings.scheme ?? "smtp",
    fromAddress: settings.fromAddress ?? "",
    fromName: settings.fromName ?? "",
  });
  const [testTo, setTestTo] = useState("");
  const [test, setTest] = useState<{ busy: boolean; result: string | null; ok: boolean }>({ busy: false, result: null, ok: false });
  const set = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await save("/admin/mail", "PUT", enabled ? { enabled: true, ...draft, port: Number(draft.port), mailPassword: draft.mailPassword || undefined } : { enabled: false });
  };

  const sendTest = async () => {
    setTest({ busy: true, result: null, ok: false });
    const response = await api<{ success: boolean; error: string | null }>("/admin/mail/test", { method: "POST", body: testTo ? { to: testTo } : {} }).catch((e: Error) => ({ success: false, error: e.message }));
    setTest({ busy: false, ok: response.success, result: response.success ? t("testSent") : (response.error ?? t("testFailed")) });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-4 accent-brand" />
          {t("useCustom")}
        </label>
        {!enabled && <p className="text-sm text-muted">{t("serverSettings", { mailer: settings.mailer, host: settings.host ?? "—" })}</p>}
        {enabled && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label={t("host")} dir="ltr" value={draft.host} onChange={set("host")} error={fields.host} required />
            <TextInput label={t("port")} type="number" value={draft.port} onChange={set("port")} error={fields.port} required />
            <TextInput label={t("username")} dir="ltr" value={draft.username} onChange={set("username")} />
            <TextInput label={t("password")} hint={settings.hasPassword ? t("passwordKept") : undefined} type="password" value={draft.mailPassword} onChange={set("mailPassword")} />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium" id="mail-scheme">
                {t("security")}
              </span>
              <Listbox
                aria-labelledby="mail-scheme"
                value={draft.scheme}
                onChange={set("scheme")}
                options={[
                  { value: "smtp", label: t("starttls") },
                  { value: "smtps", label: t("ssl") },
                ]}
              />
            </div>
            <TextInput label={t("fromAddress")} dir="ltr" type="email" value={draft.fromAddress} onChange={set("fromAddress")} error={fields.fromAddress} required />
            <TextInput label={t("fromName")} value={draft.fromName} onChange={set("fromName")} />
          </div>
        )}
        <SaveBar busy={busy} error={error} saved={saved} />
      </form>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="text-sm font-semibold">{t("test")}</p>
        <div className="flex flex-wrap items-end gap-2">
          <TextInput label={t("testTo")} hint={t("testToHint")} dir="ltr" type="email" value={testTo} onChange={setTestTo} className="w-72" />
          <button type="button" onClick={sendTest} disabled={test.busy} className="h-10 rounded-md border border-border px-4 text-sm font-semibold hover:border-brand disabled:opacity-50">
            {test.busy ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" role="status" /> : t("sendTest")}
          </button>
        </div>
        {test.result && <p className={`rounded-lg px-3 py-2 text-sm break-words ${test.ok ? "bg-brand/10 text-brand" : "bg-danger-soft text-danger"}`}>{test.result}</p>}
      </div>
    </div>
  );
}
