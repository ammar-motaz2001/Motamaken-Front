"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { AuthError, authService } from "../services/auth.service";
import type { AuthMethod, OtpPurpose } from "../types";
import { actionsClasses } from "./styles";

const LENGTH = 4;
const RESEND_SECONDS = 59;

type OtpFormProps = {
  purpose: OtpPurpose;
  method: AuthMethod;
  target: string;
  onVerified: (token?: string) => void;
};

export function OtpForm({ purpose, method, target, onVerified }: OtpFormProps) {
  const t = useTranslations("Otp");
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds === 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const focus = (index: number) => inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, i) => (i === index ? digit : item)));
    setError(null);
    if (digit) focus(index + 1);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index]) focus(index - 1);
    if (event.key === "ArrowLeft") focus(index - 1);
    if (event.key === "ArrowRight") focus(index + 1);
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? ""));
    focus(pasted.length);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = digits.join("");
    if (code.length < LENGTH) {
      setError(t("incomplete"));
      return;
    }
    setSubmitting(true);
    try {
      const { token } = await authService.verifyOtp({ purpose, method, target, code });
      onVerified(token);
    } catch (err) {
      setError(err instanceof AuthError && err.message ? err.message : t("failed"));
      setSubmitting(false);
    }
  };

  const resend = async () => {
    await authService.resendOtp({ purpose, method, target });
    setDigits(Array(LENGTH).fill(""));
    setSeconds(RESEND_SECONDS);
    focus(0);
  };

  return (
    <form className="flex flex-col px-2 pt-4 sm:px-[30px]" onSubmit={onSubmit} noValidate>
      <div className="pb-2 text-center">
        <p className="text-base font-medium capitalize">{t("title")}</p>
        <p className="text-sm">{method === "email" ? t("subtitleEmail") : t("subtitlePhone")}</p>
      </div>

      <div dir="ltr" className="flex h-12 justify-center gap-4">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            value={digit}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            autoFocus={index === 0}
            aria-label={t("digit", { index: index + 1 })}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={onPaste}
            className={`h-12 rounded-lg border text-center text-base font-medium outline-none transition-colors focus:border-brand ${
              method === "email" ? "w-[63px]" : "w-12"
            } ${digit ? "border-otp-filled bg-otp-filled" : "border-border bg-otp"} ${error ? "border-danger" : ""}`}
          />
        ))}
      </div>

      {error && <p className="pt-2 text-center text-sm text-danger">{error}</p>}

      <div className={actionsClasses}>
        <Button type="submit" width={231} loading={submitting}>
          {t("verify")}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-[3px]">
        <p dir="ltr" className="text-sm leading-4 text-orange">
          00:{String(seconds).padStart(2, "0")}
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={seconds > 0}
          className="border-b border-brand-border text-sm leading-4 text-gradient-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("resend")}
        </button>
      </div>
    </form>
  );
}
