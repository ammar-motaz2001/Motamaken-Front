"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PhoneField } from "@/components/ui/PhoneField";
import { Link } from "@/i18n/navigation";
import { rememberReferral } from "../lib/referral";
import { validateEmail, validateName, validatePhone, type ValidationKey } from "../lib/validation";
import { AuthError, authService } from "../services/auth.service";
import type { AuthMethod } from "../types";
import { OtpForm } from "./OtpForm";
import { Recaptcha, recaptchaEnabled } from "./Recaptcha";

export type QuickAuthResult = { accessToken: string; name: string; isNew: boolean };

type QuickAuthModalProps = {
  open: boolean;
  methods: AuthMethod[];
  /** Why we ask now, e.g. "Confirm your email to publish your project". */
  reason?: string;
  /** Where "Log in with a password" should come back to. */
  loginNext: string;
  onClose: () => void;
  onDone: (result: QuickAuthResult) => Promise<void> | void;
};

/**
 * The one sign-up step a guest meets, and only at a final button (publish, send, pay): an email or phone, then a
 * 4-digit code. New addresses get an account on the spot, known ones are simply signed in.
 */
export function QuickAuthModal({ open, methods, reason, loginNext, onClose, onDone }: QuickAuthModalProps) {
  const t = useTranslations("QuickAuth");
  const tv = useTranslations("Validation");
  const [method, setMethod] = useState<AuthMethod>(methods[0] ?? "email");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ identifier?: ValidationKey; name?: ValidationKey }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [target, setTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const payload = () => (method === "email" ? { method, email: identifier.trim() } : { method, phone: identifier });

  const start = async (event: FormEvent) => {
    event.preventDefault();
    const found = {
      identifier: method === "email" ? validateEmail(identifier) : validatePhone(identifier),
      name: name.trim() ? validateName(name) : undefined,
    };
    setErrors(found);
    setFormError(null);
    if (found.identifier || found.name) return;
    if (recaptchaEnabled && !captcha) {
      setFormError(t("captcha"));
      return;
    }
    setBusy(true);
    try {
      const { target: sentTo } = await authService.quickStart({ ...payload(), ...(captcha && { recaptchaToken: captcha }) });
      setTarget(sentTo);
    } catch (error) {
      setFormError(error instanceof AuthError && error.message ? error.message : t("failed"));
      setCaptchaReset((count) => count + 1);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (code: string) => {
    const referralCode = rememberReferral(undefined);
    const result = await authService.quickVerify({ ...payload(), code, ...(name.trim() && { name: name.trim() }), ...(referralCode && { referralCode }) });
    await onDone({ accessToken: result.accessToken, name: result.user.fullName, isNew: result.isNew });
    return { accessToken: result.accessToken };
  };

  const close = () => {
    if (busy) return;
    setTarget(null);
    setFormError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      showClose
      title={
        <span className="flex flex-col gap-1 text-start">
          {t(target ? "codeTitle" : "title")}
          <span className="text-sm font-normal text-muted">{target ? t("codeSent", { target: `⁦${target}⁩` }) : (reason ?? t("subtitle"))}</span>
        </span>
      }
    >
      {target ? (
        <div className="flex w-full flex-col gap-3">
          <OtpForm purpose="quick" method={method} target={target} subtitle="" verify={verify} onVerified={() => undefined} className="flex flex-col gap-1" />
          <button type="button" onClick={() => setTarget(null)} className="self-center text-sm text-muted underline">
            {t("changeAddress")}
          </button>
        </div>
      ) : (
        <form onSubmit={start} noValidate className="flex w-full flex-col gap-4 text-start">
          {methods.length > 1 && (
            <div role="tablist" className="grid grid-cols-2 gap-2 rounded-lg bg-surface-muted p-1">
              {methods.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={method === option}
                  onClick={() => (setMethod(option), setIdentifier(""), setErrors({}))}
                  className={`rounded-md py-2 text-sm font-medium ${method === option ? "bg-surface text-brand shadow-card" : "text-muted"}`}
                >
                  {t(`methods.${option}`)}
                </button>
              ))}
            </div>
          )}
          {method === "email" ? (
            <Field
              label={t("email")}
              type="email"
              autoComplete="email"
              dir="ltr"
              autoFocus
              value={identifier}
              error={errors.identifier && tv(errors.identifier)}
              onChange={(event) => (setIdentifier(event.target.value), setErrors({}), setFormError(null))}
            />
          ) : (
            <PhoneField label={t("phone")} value={identifier} error={errors.identifier && tv(errors.identifier)} onChange={(value) => (setIdentifier(value), setErrors({}))} />
          )}
          <Field
            label={t("name")}
            hint={t("nameHint")}
            autoComplete="name"
            value={name}
            error={errors.name && tv(errors.name)}
            onChange={(event) => (setName(event.target.value), setErrors({}))}
          />
          <Recaptcha action="quick_start" resetKey={captchaReset} onChange={setCaptcha} />
          {formError && (
            <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}
          <Button type="submit" variant="solid" font="button" loading={busy} className="w-full">
            {t("sendCode")}
          </Button>
          <p className="text-center text-xs text-muted">{t("terms")}</p>
          <p className="text-center text-sm">
            {t("havePassword")}{" "}
            <Link href={{ pathname: "/login", query: { next: loginNext } }} className="font-bold text-brand">
              {t("login")}
            </Link>
          </p>
        </form>
      )}
    </Modal>
  );
}
