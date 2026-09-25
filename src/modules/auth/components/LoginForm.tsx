"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, PasswordField } from "@/components/ui/Field";
import { PhoneField } from "@/components/ui/PhoneField";
import { Link, useRouter } from "@/i18n/navigation";
import { hasErrors, validateEmail, validatePhone, type ValidationKey } from "../lib/validation";
import { AFTER_LOGIN_PATH } from "@/lib/session";
import { createSession } from "../actions";
import { AuthError, authService } from "../services/auth.service";
import type { AuthMethod, FieldErrors } from "../types";
import { SocialAuth } from "./SocialAuth";
import { actionsClasses, fieldsClasses, formClasses, switchClasses } from "./styles";

export function LoginForm({ method, next }: { method: AuthMethod; next?: string }) {
  const t = useTranslations("Login");
  const ta = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"identifier" | "password">>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const message = (key?: ValidationKey) => (key ? tv(key) : undefined);

  const changeIdentifier = (value: string) => {
    setIdentifier(value);
    setFormError(null);
    setErrors((current) => ({ ...current, identifier: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors<"identifier" | "password"> = {
      identifier: method === "email" ? validateEmail(identifier) : validatePhone(identifier),
      password: password ? undefined : "passwordRequired",
    };
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const target = identifier.trim();
      const { otpRequired, accessToken } = await authService.login({ method, identifier: target, password });
      if (otpRequired) {
        router.push({ pathname: "/login/verify", query: { method, to: target, ...(next && { next }) } });
        return;
      }
      await createSession(accessToken ?? "");
      router.replace(next ?? AFTER_LOGIN_PATH);
    } catch (error) {
      const fallback = method === "email" ? t("invalidEmail") : t("invalidPhone");
      setFormError(error instanceof AuthError && error.message ? error.message : fallback);
      setSubmitting(false);
    }
  };

  return (
    <>
      <form className={formClasses} onSubmit={onSubmit} noValidate>
        <div className={fieldsClasses}>
          {method === "email" ? (
            <Field
              label={ta("email")}
              type="email"
              icon="/images/sms.svg"
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              value={identifier}
              error={message(errors.identifier)}
              invalid={Boolean(formError)}
              onChange={(event) => changeIdentifier(event.target.value)}
            />
          ) : (
            <PhoneField
              label={t("phone")}
              placeholder="-- --- ----"
              value={identifier}
              error={message(errors.identifier)}
              invalid={Boolean(formError)}
              onChange={changeIdentifier}
            />
          )}
          <PasswordField
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            value={password}
            error={message(errors.password) ?? formError ?? undefined}
            onChange={(event) => {
              setPassword(event.target.value);
              setFormError(null);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
          />
        </div>

        <Link
          href={{ pathname: "/forgot-password", query: { method } }}
          className="self-end py-2.5 text-base text-orange hover:underline"
        >
          {t("forgot")}
        </Link>

        <div className={actionsClasses}>
          <Button type="submit" width={231} loading={submitting}>
            {t("submit")}
          </Button>
        </div>

        <p className={switchClasses}>
          {t("noAccount")} <Link href={{ pathname: "/signup", query: { method } }}>{t("createAccount")}</Link>
        </p>
      </form>

      <SocialAuth />
    </>
  );
}
