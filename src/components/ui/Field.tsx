"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

type FieldShellProps = {
  id: string;
  label?: string;
  required?: boolean;
  info?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  className?: string;
  children: ReactNode;
};

export const controlClasses = (invalid: boolean) =>
  `flex h-[45px] items-center gap-[15px] rounded-[5px] border bg-surface px-2.5 transition-colors ${
    invalid ? "border-danger text-danger" : "border-border focus-within:border-brand"
  }`;

export function FieldShell({ id, label, required, info, hint, error, invalid, className = "", children }: FieldShellProps) {
  const message = error ?? hint;

  return (
    <div className={`flex w-full min-w-0 flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center gap-2.5">
          <label htmlFor={id} className="text-base font-medium capitalize">
            {label}
            {required && <span className="text-danger"> * </span>}
          </label>
          {info && (
            <span title={info} className="flex cursor-help">
              <Image src="/images/info-circle.svg" alt={info} width={19} height={19} />
            </span>
          )}
        </div>
      )}
      <div className={controlClasses(Boolean(error || invalid))}>{children}</div>
      {message && (
        <p
          id={`${id}-message`}
          className={`-mt-[7px] text-end font-hint text-xs font-light tracking-[0.6px] ${error ? "text-danger" : "text-orange"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> &
  Omit<FieldShellProps, "id" | "children"> & {
    icon?: string;
    trailing?: ReactNode;
  };

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, required, info, hint, error, invalid, icon, trailing, id, className, ...inputProps },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      required={required}
      info={info}
      hint={hint}
      error={error}
      invalid={invalid}
      className={className}
    >
      {icon && <Image src={icon} alt="" width={20} height={20} className="dark:invert" />}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error || invalid)}
        aria-describedby={error || hint ? `${inputId}-message` : undefined}
        className="h-full min-w-0 flex-1 bg-transparent text-base text-inherit outline-none"
        {...inputProps}
      />
      {trailing}
    </FieldShell>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, "type" | "trailing">>(function PasswordField(
  props,
  ref,
) {
  const t = useTranslations("Auth");
  const [visible, setVisible] = useState(false);

  return (
    <Field
      ref={ref}
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          className="flex shrink-0 text-muted transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff size={20} strokeWidth={1.5} aria-hidden /> : <Eye size={20} strokeWidth={1.5} aria-hidden />}
        </button>
      }
    />
  );
});
