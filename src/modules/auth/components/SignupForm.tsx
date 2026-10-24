"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { PolicyCheckbox } from "@/components/policy/PolicyCheckbox";
import { Field, PasswordField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PhoneField } from "@/components/ui/PhoneField";
import { Link, useRouter } from "@/i18n/navigation";
import {
  hasErrors,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateUsername,
  type ValidationKey,
} from "../lib/validation";
import { rememberReferral, shouldRecordVisit } from "../lib/referral";
import { AuthError, authService } from "../services/auth.service";
import type { AuthMethod, FieldErrors } from "../types";
import { ErrorModal } from "./ErrorModal";
import { PasswordStrength } from "./PasswordStrength";
import { Recaptcha, recaptchaEnabled, recaptchaMissingMessage, recaptchaNeedsTick, recaptchaToken } from "./Recaptcha";
import { SuccessTitle } from "./SuccessTitle";
import { actionsClasses, fieldsClasses, formClasses, modalTextClasses, switchClasses } from "./styles";

type Values = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  terms: boolean;
  subscribe: boolean;
};

type FieldName = Exclude<keyof Values, "subscribe">;

const INITIAL_VALUES: Values = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  terms: false,
  subscribe: true,
};

/** Checks every sign-up field, only email or phone depending on the method, and that the terms are accepted. */
function validate(values: Values, method: AuthMethod): FieldErrors<FieldName> {
  return {
    firstName: validateName(values.firstName),
    lastName: validateName(values.lastName),
    username: validateUsername(values.username),
    email: method === "email" ? validateEmail(values.email) : undefined,
    phone: method === "phone" ? validatePhone(values.phone) : undefined,
    password: validatePassword(values.password),
    terms: values.terms ? undefined : "termsRequired",
  };
}

/**
 * Sign-up form: validates, confirms, passes reCAPTCHA, then POST /auth/signup and on to the code screen. Records a visit
 * for a referral code once per session.
 */
export function SignupForm({ method, referralCode }: { method: AuthMethod; referralCode?: string }) {
  const t = useTranslations("Signup");
  const tv = useTranslations("Validation");
  const ta = useTranslations("Auth");
  const router = useRouter();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<FieldName>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [captchaError, setCaptchaError] = useState<string | undefined>(undefined);

  const [referral, setReferral] = useState<string | undefined>(undefined);

  useEffect(() => {
    const code = rememberReferral(referralCode);
    if (referralCode && shouldRecordVisit(referralCode)) void authService.recordReferralVisit(referralCode).catch(() => undefined);
    // Read once on mount: localStorage is not available while rendering on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReferral(code);
  }, [referralCode]);

  const message = (key?: ValidationKey) => (key ? tv(key) : undefined);

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const target = method === "email" ? values.email.trim() : values.phone;

  const submit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    const token = await recaptchaToken(captcha, "signup");
    if (recaptchaEnabled && !token) {
      setCaptchaError(ta(recaptchaMissingMessage));
      setSubmitting(false);
      return;
    }
    try {
      await authService.signup({
        method,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        username: values.username.trim(),
        email: method === "email" ? target : undefined,
        phone: method === "phone" ? target : undefined,
        password: values.password,
        subscribe: values.subscribe,
        ...(referral && { referralCode: referral }),
        ...(token && { recaptchaToken: token }),
      });
      router.push({ pathname: "/signup/verify", query: { method, to: target } });
    } catch (caught) {
      // A token works once: show a fresh box whatever went wrong.
      setCaptchaReset((count) => count + 1);
      const captchaMessage = caught instanceof AuthError ? caught.fields.recaptchaToken : undefined;
      if (captchaMessage) setCaptchaError(captchaMessage);
      else setFailed(true);
      setSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values, method);
    setErrors(nextErrors);
    const needsCaptcha = recaptchaNeedsTick && !captcha;
    setCaptchaError(needsCaptcha ? ta(recaptchaMissingMessage) : undefined);
    if (hasErrors(nextErrors) || needsCaptcha) return;
    setConfirmOpen(true);
  };

  return (
    <>
      <form className={formClasses} onSubmit={onSubmit} noValidate>
        <div className={fieldsClasses}>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <Field
              label={t("firstName")}
              placeholder={t("firstNamePlaceholder")}
              autoComplete="given-name"
              value={values.firstName}
              error={message(errors.firstName)}
              onChange={(event) => update("firstName", event.target.value)}
            />
            <Field
              label={t("lastName")}
              placeholder={t("lastNamePlaceholder")}
              autoComplete="family-name"
              value={values.lastName}
              error={message(errors.lastName)}
              onChange={(event) => update("lastName", event.target.value)}
            />
          </div>

          <Field
            label={t("username")}
            required
            info={t("usernameRule")}
            placeholder={t("usernamePlaceholder")}
            autoComplete="username"
            value={values.username}
            hint={t("usernameRule")}
            error={message(errors.username)}
            onChange={(event) => update("username", event.target.value)}
          />

          {method === "email" ? (
            <Field
              label={ta("email")}
              required
              type="email"
              icon="/images/sms.svg"
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              value={values.email}
              error={message(errors.email)}
              onChange={(event) => update("email", event.target.value)}
            />
          ) : (
            <PhoneField
              label={t("phone")}
              placeholder="-- --- ----"
              value={values.phone}
              error={message(errors.phone)}
              onChange={(value) => update("phone", value)}
            />
          )}

          <PasswordField
            label={t("password")}
            required
            placeholder="********"
            autoComplete="new-password"
            value={values.password}
            error={values.password ? undefined : message(errors.password)}
            invalid={Boolean(errors.password)}
            onChange={(event) => update("password", event.target.value)}
          />
          <PasswordStrength password={values.password} />
        </div>

        <div className="flex flex-col items-start gap-2 pt-2">
          <PolicyCheckbox checked={values.terms} invalid={Boolean(errors.terms)} onChange={(checked) => update("terms", checked)}>
            {(link) => (
              <>
                {t("agree")} {link(t("privacyPolicy"))}
              </>
            )}
          </PolicyCheckbox>
          {errors.terms && <p className="font-hint text-xs font-light tracking-[0.6px] text-danger">{tv(errors.terms)}</p>}
          <Checkbox checked={values.subscribe} onChange={(event) => update("subscribe", event.target.checked)}>
            {t("subscribe")}
          </Checkbox>
          <Recaptcha
            action="signup"
            resetKey={captchaReset}
            error={captchaError}
            onChange={(token) => {
              setCaptcha(token);
              if (token) setCaptchaError(undefined);
            }}
          />
        </div>

        <div className={actionsClasses}>
          <Button type="submit" width={220} loading={submitting}>
            {t("submit")}
          </Button>
        </div>

        <p className={switchClasses}>
          {t("haveAccount")} <Link href={{ pathname: "/login", query: { method } }}>{t("login")}</Link>
        </p>
      </form>


      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={<SuccessTitle />}>
        <p className={modalTextClasses}>
          {method === "email"
            ? t("confirmEmail", { email: `\u2066${values.email.trim()}\u2069` })
            : t("confirmPhone", { phone: `\u2066${formatPhoneNumberIntl(values.phone)}\u2069` })}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button font="button" onClick={() => setConfirmOpen(false)}>
            {method === "email" ? t("reenterEmail") : t("reenterPhone")}
          </Button>
          <Button font="button" variant="outline" onClick={submit}>
            {t("yesCorrect")}
          </Button>
        </div>
      </Modal>

      <ErrorModal open={failed} onClose={() => setFailed(false)} title={t("errorTitle")} message={t("errorMessage")} />
    </>
  );
}
