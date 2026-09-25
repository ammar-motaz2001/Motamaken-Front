"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/Field";
import { useRouter } from "@/i18n/navigation";
import { hasErrors, validatePassword, validatePasswordConfirmation } from "../lib/validation";
import { authService } from "../services/auth.service";
import type { FieldErrors } from "../types";
import { PasswordStrength } from "./PasswordStrength";
import { actionsClasses, fieldsClasses, formClasses } from "./styles";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("ResetPassword");
  const tv = useTranslations("Validation");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"password" | "confirmation">>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      password: validatePassword(password),
      confirmation: validatePasswordConfirmation(password, confirmation),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await authService.resetPassword({ token, password });
      router.push("/reset-password/success");
    } catch {
      router.push("/reset-password/error");
    }
  };

  return (
    <form className={formClasses} onSubmit={onSubmit} noValidate>
      <div className={fieldsClasses}>
        <PasswordField
          label={t("newPassword")}
          placeholder={t("newPasswordPlaceholder")}
          autoComplete="new-password"
          value={password}
          error={!password && errors.password ? tv(errors.password) : undefined}
          invalid={Boolean(errors.password)}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
        />
        <PasswordStrength password={password} />
        <PasswordField
          label={t("confirmPassword")}
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          value={confirmation}
          error={errors.confirmation && tv(errors.confirmation)}
          onChange={(event) => {
            setConfirmation(event.target.value);
            setErrors((current) => ({ ...current, confirmation: undefined }));
          }}
        />
      </div>

      <div className={actionsClasses}>
        <Button type="submit" width={231} loading={submitting}>
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
