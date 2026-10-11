"use client";

import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import { hasErrors, validateName, validateUsername } from "@/modules/auth/lib/validation";
import { AvatarEditor } from "./AvatarEditor";
import { SettingsPanel } from "./SettingsPanel";

type Form = { firstName: string; lastName: string; username: string; subscribed: boolean };

export function ProfileSettings({ user: initial }: { user: User & { subscribed?: boolean } }) {
  const t = useTranslations("Settings.profile");
  const v = useTranslations("Validation");
  const router = useRouter();
  const [user, setUser] = useState(initial);
  const [form, setForm] = useState<Form>({
    firstName: initial.firstName ?? "",
    lastName: initial.lastName ?? "",
    username: initial.username,
    subscribed: Boolean(initial.subscribed),
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => (setForm((current) => ({ ...current, [key]: value })), setErrors({}));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = {
      firstName: form.firstName && validateName(form.firstName) ? v(validateName(form.firstName)!) : undefined,
      lastName: form.lastName && validateName(form.lastName) ? v(validateName(form.lastName)!) : undefined,
      username: validateUsername(form.username) ? v(validateUsername(form.username)!) : undefined,
    };
    setErrors(found);
    if (hasErrors(found)) return;

    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: User }>("/me", {
        method: "PATCH",
        body: { firstName: form.firstName.trim() || null, lastName: form.lastName.trim() || null, username: form.username.trim(), subscribed: form.subscribed },
      });
      setUser({ ...user, ...data });
      setSaved(true);
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      if (!Object.keys(apiError.fields).length) setError(apiError.message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  if (saved) {
    return (
      <SettingsPanel title={t("title")}>
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <StatusIcon type="success" size={72} />
          <p className="text-lg font-bold text-brand uppercase">{t("saved")}</p>
          <Button variant="solid" font="button" onClick={() => setSaved(false)}>
            {t("back")}
          </Button>
        </div>
      </SettingsPanel>
    );
  }

  const verified = (when?: string | null) =>
    when ? (
      <span className="flex shrink-0 items-center gap-1 text-xs text-brand">
        <BadgeCheck className="size-4" />
        {t("verified")}
      </span>
    ) : (
      <Link href="/settings/verification" className="shrink-0 text-xs text-orange hover:underline">
        {t("notVerified")}
      </Link>
    );

  return (
    <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <AvatarEditor user={user} onChange={(next) => (setUser({ ...user, ...next }), router.refresh())} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("firstName")} value={form.firstName} error={errors.firstName} maxLength={50} onChange={(event) => set("firstName", event.target.value)} />
          <Field label={t("lastName")} value={form.lastName} error={errors.lastName} maxLength={50} onChange={(event) => set("lastName", event.target.value)} />
          <Field label={t("username")} required value={form.username} error={errors.username} maxLength={50} onChange={(event) => set("username", event.target.value)} className="sm:col-span-2" />
          <Field label={t("email")} value={user.email ?? "—"} readOnly dir="ltr" trailing={user.email ? verified(user.emailVerifiedAt) : undefined} />
          <Field label={t("phone")} value={user.phone ?? "—"} readOnly dir="ltr" trailing={user.phone ? verified(user.phoneVerifiedAt) : undefined} />
        </div>
        <p className="-mt-2 text-xs text-muted">{t("contactHint")}</p>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={form.subscribed} onChange={(event) => set("subscribed", event.target.checked)} className="size-4 accent-brand" />
          {t("newsletter")}
        </label>
        <p className="text-sm">
          {t.rich("workProfile", { link: (chunks) => <Link href="/profile" className="font-bold text-brand hover:underline">{chunks}</Link> })}
        </p>
        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" font="button" onClick={() => (setForm({ firstName: user.firstName ?? "", lastName: user.lastName ?? "", username: user.username, subscribed: Boolean(form.subscribed) }), setErrors({}))}>
            {t("cancel")}
          </Button>
          <Button type="submit" variant="solid" font="button" loading={busy}>
            {t("save")}
          </Button>
        </div>
      </form>
    </SettingsPanel>
  );
}
