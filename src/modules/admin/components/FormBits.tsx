"use client";

import { useTranslations } from "next-intl";
import { useId, type ReactNode } from "react";
import { inputClasses } from "./ActionButton";

export function LabeledInput({
  label,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children(id)}
      {(error || hint) && <p className={`text-xs ${error ? "text-danger" : "text-muted"}`}>{error ?? hint}</p>}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  step,
  dir,
  className,
  required,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  step?: string;
  dir?: "ltr" | "rtl";
  className?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <LabeledInput label={label} error={error} hint={hint} className={className}>
      {(id) => (
        <input id={id} type={type} step={step} dir={dir} required={required} readOnly={readOnly} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClasses} read-only:bg-surface-muted read-only:text-muted`} />
      )}
    </LabeledInput>
  );
}

export function SaveBar({ busy, error, saved, label, extra }: { busy: boolean; error: string | null; saved: boolean; label?: string; extra?: ReactNode }) {
  const t = useTranslations("Admin");
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {error && (
        <p role="alert" className="me-auto rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="me-auto text-sm text-brand">
          {t("saved")}
        </p>
      )}
      {extra}
      <button type="submit" disabled={busy} className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" role="status" /> : (label ?? t("save"))}
      </button>
    </div>
  );
}
