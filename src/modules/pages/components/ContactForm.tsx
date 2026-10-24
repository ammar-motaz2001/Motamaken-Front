"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import { Recaptcha, recaptchaEnabled, recaptchaMissingMessage, recaptchaNeedsTick, recaptchaToken } from "@/modules/auth/components/Recaptcha";

const TOPICS = ["general", "account", "payments", "disputes", "technical", "partnership", "other"] as const;

/**
 * "Contact us". Signed-in users don't need to type their name and email: the API takes them from the account.
 */
export function ContactForm({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("SitePages.contact");
  const [form, setForm] = useState({ name: "", email: "", topic: "general", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const ta = useTranslations("Auth");

  const set = (key: keyof typeof form, value: string) => (setForm((current) => ({ ...current, [key]: value })), setErrors({}));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!signedIn && recaptchaNeedsTick && !captcha) {
      setErrors({ recaptchaToken: ta(recaptchaMissingMessage) });
      return;
    }
    setState("busy");
    setError(null);
    const token = signedIn ? null : await recaptchaToken(captcha, "contact");
    if (!signedIn && recaptchaEnabled && !token) {
      setErrors({ recaptchaToken: ta(recaptchaMissingMessage) });
      setState("idle");
      return;
    }
    try {
      await api("/contact", { method: "POST", body: signedIn ? { topic: form.topic, subject: form.subject, message: form.message } : { ...form, recaptchaToken: token } });
      setState("sent");
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError(Object.keys(apiError.fields).length ? null : apiError.message || t("failed"));
      setState("idle");
      if (!signedIn) setCaptchaReset((count) => count + 1);
    }
  };

  if (state === "sent") {
    return <p className="rounded-2xl bg-brand-soft p-6 font-medium text-brand-ink">{t("sent")}</p>;
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 sm:p-10">
      <h2 className="text-lg font-bold">{t("title")}</h2>
      {!signedIn && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("name")} required autoComplete="name" value={form.name} error={errors.name} onChange={(event) => set("name", event.target.value)} />
          <Field label={t("email")} required type="email" autoComplete="email" dir="ltr" value={form.email} error={errors.email} onChange={(event) => set("email", event.target.value)} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label={t("topic")} required value={form.topic} options={TOPICS.map((topic) => ({ value: topic, label: t(`topics.${topic}`) }))} error={errors.topic} onChange={(event) => set("topic", event.target.value)} />
        <Field label={t("subject")} required value={form.subject} error={errors.subject} onChange={(event) => set("subject", event.target.value)} />
      </div>
      <TextArea label={t("message")} required rows={6} value={form.message} error={errors.message} onChange={(event) => set("message", event.target.value)} />
      {!signedIn && <Recaptcha action="contact" resetKey={captchaReset} error={errors.recaptchaToken} onChange={setCaptcha} />}
      {error && <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p>}
      <Button type="submit" variant="solid" font="button" loading={state === "busy"} className="self-end">
        {t("send")}
      </Button>
    </form>
  );
}
