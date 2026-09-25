"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, PasswordField } from "@/components/ui/Field";
import { PhoneField } from "@/components/ui/PhoneField";
import { Link, useRouter } from "@/i18n/navigation";
import { hasErrors, validateEmail, validatePhone, type ValidationKey } from "../lib/validation";
import { AuthError, authService } from "../services/auth.service";
import type { AuthMethod, FieldErrors } from "../types";
import { SocialAuth } from "./SocialAuth";
import { actionsClasses, fieldsClasses, formClasses, formErrorClasses, switchClasses } from "./styles";

export function LoginForm({ method }: { method: AuthMethod }) {
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
      await authService.login({ method, identifier: identifier.trim(), password });
      router.push("/");
    } catch (error) {
      setFormError(error instanceof AuthError && error.message ? error.message : t("failed"));
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
              onChange={(event) => changeIdentifier(event.target.value)}
            />
          ) : (
            <PhoneField
              label={t("phone")}
              placeholder="-- --- ----"
              value={identifier}
              error={message(errors.identifier)}
              onChange={changeIdentifier}
            />
          )}
          <PasswordField
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            value={password}
            error={message(errors.password)}
            onChange={(event) => {
              setPassword(event.target.value);
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

        {formError && <p className={formErrorClasses}>{formError}</p>}

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
