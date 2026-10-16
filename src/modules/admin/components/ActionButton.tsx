"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";

export type ActionField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox";
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  step?: string;
  /** Only shown while another field has this value, e.g. the split percent for a "split" decision. */
  showWhen?: { field: string; value: string };
};

type Props = {
  label: string;
  endpoint: string;
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
  tone?: "brand" | "outline" | "danger" | "orange";
  size?: "sm" | "md";
  /** Asked with the browser's confirm box when there are no fields. */
  confirm?: string;
  /** Opens a small form; the values are sent as the request body. */
  fields?: ActionField[];
  title?: string;
  description?: string;
  body?: Record<string, unknown>;
  /** Navigate here after success instead of refreshing. */
  redirectTo?: string;
};

const TONES = {
  brand: "bg-brand text-white border-brand",
  outline: "border-border bg-surface text-foreground hover:border-brand",
  danger: "border-danger/40 bg-surface text-danger hover:bg-danger-soft",
  orange: "border-orange bg-surface text-orange hover:bg-orange/10",
};

export const inputClasses = "w-full rounded-[5px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand";

export function ActionButton({ label, endpoint, method = "POST", tone = "outline", size = "sm", confirm, fields, title, description, body, redirectTo }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((fields ?? []).map((field) => [field.name, field.defaultValue ?? ""])),
  );

  const visible = (field: ActionField) => !field.showWhen || values[field.showWhen.field] === field.showWhen.value;

  const send = async () => {
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const payload: Record<string, unknown> = { ...body };
    (fields ?? []).filter(visible).forEach((field) => {
      const value = values[field.name];
      if (field.type === "checkbox") payload[field.name] = value === "1";
      else if (value === "") return;
      else payload[field.name] = field.type === "number" ? Number(value) : value;
    });
    try {
      await api(endpoint, { method, body: Object.keys(payload).length ? payload : undefined });
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setFieldErrors(apiError.fields ?? {});
      setError(apiError.message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  const onClick = () => {
    if (fields?.length) {
      setError(null);
      setOpen(true);
      return;
    }
    if (confirm && !window.confirm(confirm)) return;
    void send();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send();
  };

  const sizing = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border font-semibold whitespace-nowrap transition-colors disabled:opacity-50 ${sizing} ${TONES[tone]}`}
      >
        {busy && !open ? <span className="size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" role="status" /> : label}
      </button>
      {!open && error && !fields?.length && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}

      <Modal open={open} onClose={() => !busy && setOpen(false)} title={title ?? label} showClose>
        <form onSubmit={submit} className="flex w-full flex-col gap-4 text-start">
          {description && <p className="text-sm text-muted">{description}</p>}
          {(fields ?? []).filter(visible).map((field) => {
            const id = `action-${field.name}`;
            const set = (value: string) => setValues((current) => ({ ...current, [field.name]: value }));
            const message = fieldErrors[field.name];
            if (field.type === "checkbox") {
              return (
                <label key={field.name} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={values[field.name] === "1"} onChange={(event) => set(event.target.checked ? "1" : "")} className="size-4 accent-brand" />
                  {field.label}
                </label>
              );
            }
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label htmlFor={id} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-danger"> *</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea id={id} rows={4} required={field.required} value={values[field.name]} placeholder={field.placeholder} onChange={(event) => set(event.target.value)} className={inputClasses} />
                ) : field.type === "select" ? (
                  <select id={id} required={field.required} value={values[field.name]} onChange={(event) => set(event.target.value)} className={inputClasses}>
                    <option value="" disabled>
                      {t("choose")}
                    </option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    type={field.type ?? "text"}
                    step={field.step}
                    required={field.required}
                    value={values[field.name]}
                    placeholder={field.placeholder}
                    onChange={(event) => set(event.target.value)}
                    className={inputClasses}
                  />
                )}
                {(message || field.hint) && <p className={`text-xs ${message ? "text-danger" : "text-muted"}`}>{message ?? field.hint}</p>}
              </div>
            );
          })}
          {error && (
            <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-md border border-border px-4 text-sm font-semibold">
              {t("cancel")}
            </button>
            <button type="submit" disabled={busy} className={`h-10 rounded-md border px-5 text-sm font-semibold disabled:opacity-50 ${tone === "danger" ? "border-danger bg-danger text-white" : "border-brand bg-brand text-white"}`}>
              {busy ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" role="status" /> : (title ?? label)}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
