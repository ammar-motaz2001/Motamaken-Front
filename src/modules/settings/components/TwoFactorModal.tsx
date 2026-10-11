"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Button } from "@/components/ui/Button";
import { Field, PasswordField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PhoneField } from "@/components/ui/PhoneField";
import { ResultModal } from "@/components/ui/ResultModal";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";

type Step = "method" | "password" | "target" | "confirm" | "code" | "success" | "error";
type Method = "phone" | "email";

export type SecurityState = {
  twoFactor: { enabled: boolean; method: Method | null; target: string | null; enabledAt: string | null };
  passwordChangedAt: string | null;
  sessions: { id: number; device: string; ip: string | null; lastUsedAt: string; createdAt: string; isCurrent: boolean }[];
};

type TwoFactorModalProps = { open: boolean; onClose: () => void; onEnabled: (state: SecurityState) => void; email: string | null; phone: string | null };

export function TwoFactorModal({ open, onClose, onEnabled, email, phone }: TwoFactorModalProps) {
  const t = useTranslations("Settings.security.enable");
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("phone");
  const [password, setPassword] = useState("");
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [masked, setMasked] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const close = () => {
    setStep("method");
    setPassword("");
    setTarget("");
    setCode("");
    setError(null);
    onClose();
  };

  const toTarget = (event: FormEvent) => {
    event.preventDefault();
    if (!password) return setError(t("passwordRequired"));
    setError(null);
    setTarget(method === "phone" ? (phone ?? "") : (email ?? ""));
    setStep("target");
  };

  const toConfirm = (event: FormEvent) => {
    event.preventDefault();
    const valid = method === "phone" ? isValidPhoneNumber(target || "") : /^\S+@\S+\.\S+$/.test(target);
    if (!valid) return setError(t(method === "phone" ? "phoneInvalid" : "emailInvalid"));
    setError(null);
    setStep("confirm");
  };

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ target: string }>("/me/two-factor", { method: "POST", body: { method, password, target } });
      setMasked(result.target);
      setWait(59);
      setStep("code");
    } catch (caught) {
      const apiError = caught as ApiError;
      if (apiError.fields.password) {
        setError(apiError.fields.password);
        setStep("password");
      } else if (apiError.fields.target) {
        setError(apiError.fields.target);
        setStep("target");
      } else {
        setStep("error");
      }
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{4,8}$/.test(code)) return setError(t("codeInvalid"));
    setBusy(true);
    setError(null);
    try {
      onEnabled(await api<SecurityState>("/me/two-factor/confirm", { method: "POST", body: { code } }));
      setStep("success");
    } catch (caught) {
      const apiError = caught as ApiError;
      if (apiError.code === "two_factor_expired") setStep("error");
      else setError(apiError.message || t("codeInvalid"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    await api("/me/two-factor/resend", { method: "POST" }).catch((caught: ApiError) => setError(caught.message ?? null));
    setWait(59);
  };

  if (!open) return null;

  if (step === "success" || step === "error") {
    return (
      <ResultModal
        open
        onClose={close}
        type={step}
        title={<span className="text-start">{t("title")}</span>}
        message={
          <span className="flex flex-col gap-1">
            {t(step === "success" ? "success" : "failed")}
            {step === "success" && <span className="text-sm font-normal text-muted">{t("successHint")}</span>}
          </span>
        }
      >
        {step === "success" ? (
          <Button variant="primary" font="button" onClick={close}>
            {t("back")}
          </Button>
        ) : (
          <Button variant="outlineOrange" font="button" onClick={() => (setStep("method"), setError(null))}>
            {t("tryOther")}
          </Button>
        )}
      </ResultModal>
    );
  }

  const actions = (primary: string, onBack?: () => void, type: "submit" | "button" = "submit", onClick?: () => void) => (
    <div className="flex justify-center gap-3">
      <Button variant="outline" font="button" onClick={onBack ?? close}>
        {onBack ? t("back") : t("cancel")}
      </Button>
      <Button type={type} variant="solid" font="button" loading={busy} onClick={onClick}>
        {primary}
      </Button>
    </div>
  );

  return (
    <Modal
      open
      onClose={close}
      showClose
      title={
        <span className="flex flex-col gap-1 text-start">
          {t("title")}
          <span className="text-sm font-normal text-muted">{t("subtitle")}</span>
        </span>
      }
    >
      <div className="flex w-full flex-col gap-4 text-start">
        {step === "method" && (
          <form onSubmit={(event) => (event.preventDefault(), setStep("password"))} className="flex flex-col gap-4">
            <p className="text-sm font-bold">{t("choose")}</p>
            <div role="radiogroup" aria-label={t("choose")} className="flex flex-col gap-3">
              {(["phone", "email"] as const).map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 ${method === option ? "border-orange bg-orange/10" : "border-border"}`}
                >
                  <span>
                    <span className="block text-sm font-bold">{t(`methods.${option}.title`)}</span>
                    <span className="block text-xs text-muted">{t(`methods.${option}.text`)}</span>
                  </span>
                  <input type="radio" name="method" checked={method === option} onChange={() => setMethod(option)} className="size-4 accent-orange" />
                </label>
              ))}
            </div>
            {actions(t("next"))}
          </form>
        )}

        {step === "password" && (
          <form onSubmit={toTarget} noValidate className="flex flex-col gap-4">
            <PasswordField label={t("password")} autoComplete="current-password" autoFocus value={password} error={error ?? undefined} onChange={(event) => (setPassword(event.target.value), setError(null))} />
            {actions(t("continue"), () => setStep("method"))}
          </form>
        )}

        {step === "target" && (
          <form onSubmit={toConfirm} noValidate className="flex flex-col gap-4">
            <p className="text-sm font-bold">{t(`methods.${method}.title`)}</p>
            {method === "phone" ? (
              <PhoneField label={t("phone")} value={target} error={error ?? undefined} onChange={(value) => (setTarget(value ?? ""), setError(null))} />
            ) : (
              <Field label={t("email")} type="email" dir="ltr" value={target} error={error ?? undefined} onChange={(event) => (setTarget(event.target.value), setError(null))} />
            )}
            {actions(t("next"), () => setStep("password"))}
          </form>
        )}

        {step === "confirm" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm">
              {t("confirmText", { method: t(`methods.${method}.short`) })}
              <span dir="ltr" className="mx-1 font-bold">
                {target}
              </span>
              <br />
              {t("isCorrect")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="solid" font="button" loading={busy} onClick={send}>
                {t("yesCorrect")}
              </Button>
              <Button variant="outline" font="button" onClick={() => setStep("target")}>
                {t(method === "phone" ? "reenterPhone" : "reenterEmail")}
              </Button>
            </div>
          </div>
        )}

        {step === "code" && (
          <form onSubmit={verify} noValidate className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm">{t("codeSent", { target: masked })}</p>
            <label className="flex flex-col items-center gap-2 text-sm font-bold">
              {t("code")}
              <input
                value={code}
                onChange={(event) => (setCode(event.target.value.replace(/\D/g, "").slice(0, 8)), setError(null))}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                dir="ltr"
                className={`w-40 rounded-md border px-3 py-2 text-center text-xl tracking-[0.5em] outline-none focus:border-brand ${error ? "border-danger" : "border-border"}`}
              />
            </label>
            {error && <p className="rounded bg-danger-soft px-3 py-1 text-sm text-danger">{error}</p>}
            {wait > 0 ? (
              <span className="text-xs text-brand">00:{String(wait).padStart(2, "0")}</span>
            ) : (
              <button type="button" onClick={resend} className="text-xs font-bold text-brand underline">
                {t("resend")}
              </button>
            )}
            <Button type="submit" variant="solid" font="button" loading={busy} width={200}>
              {t("verify")}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
