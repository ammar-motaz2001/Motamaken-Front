"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PhoneField } from "@/components/ui/PhoneField";
import { Link, useRouter } from "@/i18n/navigation";
import { validateEmail, validatePhone, type ValidationKey } from "../lib/validation";
import { AuthError, authService } from "../services/auth.service";
import type { AuthMethod } from "../types";
import { actionsClasses, fieldsClasses, formClasses, formErrorClasses, switchClasses } from "./styles";

export function ForgotPasswordForm({ method }: { method: AuthMethod }) {
  const t = useTranslations("ForgotPassword");
  const tv = useTranslations("Validation");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<ValidationKey>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (next: string) => {
    setValue(next);
    setError(undefined);
    setServerError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = method === "email" ? validateEmail(value) : validatePhone(value);
    setError(validationError);
    if (validationError) return;

    const target = value.trim();
    setSubmitting(true);
    try {
      const { token } = await authService.requestPasswordReset({ method, target });
      if (method === "email" && token) router.push({ pathname: "/reset-password", query: { token } });
      else router.push({ pathname: "/forgot-password/verify", query: { method, to: target } });
    } catch (err) {
      setServerError(err instanceof AuthError && err.message ? err.message : tv("generic"));
      setSubmitting(false);
    }
  };

  return (
    <form className={formClasses} onSubmit={onSubmit} noValidate>
      <div className={fieldsClasses}>
        {method === "email" ? (
          <Field
            label={t("email")}
            type="email"
            icon="/images/sms.svg"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            value={value}
            error={error && tv(error)}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <PhoneField label={t("phone")} placeholder="-- --- ----" value={value} error={error && tv(error)} onChange={onChange} />
        )}
      </div>

      {serverError && <p className={`mt-3 ${formErrorClasses}`}>{serverError}</p>}

      <div className={actionsClasses}>
        <Button type="submit" width={231} loading={submitting}>
          {method === "email" ? t("sendLink") : t("sendCode")}
        </Button>
      </div>

      <p className={switchClasses}>
        {t("changeMind")} <Link href={{ pathname: "/login", query: { method } }}>{t("backToLogin")}</Link>
      </p>
    </form>
  );
}
