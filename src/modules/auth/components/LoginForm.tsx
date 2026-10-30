"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, PasswordField } from "@/components/ui/Field";
import { PhoneField } from "@/components/ui/PhoneField";
import { Link, useRouter } from "@/i18n/navigation";
import { hasErrors, validateEmail, validatePhone, type ValidationKey } from "../lib/validation";
import { afterLoginPath } from "@/lib/session";
import { rememberWelcome } from "@/lib/welcome";
import { createSession } from "../actions";
import { GoogleSignIn } from "./GoogleSignIn";
import { AuthError, authService } from "../services/auth.service";
import type { AuthMethod, FieldErrors } from "../types";
import { actionsClasses, fieldsClasses, formClasses, switchClasses } from "./styles";

type LoginFormProps = {
  method: AuthMethod;
  next?: string;
  /** Staff sign-in (admin panel): no sign-up link, and an account that is not staff is signed straight back out. */
  staff?: boolean;
  /** Shown at once: a staff code step that turned out not to be a staff account. */
  initialError?: string;
};

/** Sign-in form (POST /auth/login): signs in at once, or goes to the code screen when a one-time or two-factor code is needed. */
export function LoginForm({ method, next, staff = false, initialError }: LoginFormProps) {
  const t = useTranslations("Login");
  const ta = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"identifier" | "password">>({});
  const [formError, setFormError] = useState<string | null>(initialError ?? null);
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
      const { otpRequired, accessToken, twoFactor, user } = await authService.login({ method, identifier: target, password });
      if (otpRequired) {
        router.push({
          pathname: "/login/verify",
          query: { method, to: target, ...(next && { next }), ...(staff && { staff: "1" }), ...(twoFactor && { tf: twoFactor.method, hint: twoFactor.target }) },
        });
        return;
      }
      // Staff sign-in: an account that is not staff is never signed in here.
      if (staff && !user?.isAdmin) {
        void authService.revoke(accessToken ?? "");
        setFormError(t("notStaff"));
        setSubmitting(false);
        return;
      }
      await createSession(accessToken ?? "");
      rememberWelcome(user?.fullName ?? user?.username ?? "");
      router.replace(afterLoginPath(next, user?.isAdmin));
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

        {!staff && <GoogleSignIn next={next} />}

        {!staff && (
          <p className={switchClasses}>
            {t("noAccount")} <Link href={{ pathname: "/signup", query: { method } }}>{t("createAccount")}</Link>
          </p>
        )}
      </form>

    </>
  );
}
