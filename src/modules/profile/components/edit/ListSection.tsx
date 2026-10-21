"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { ApiError } from "@/lib/api/errors";
import { firstError } from "./saveSection";

type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "month" | "number" | "url" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  wide?: boolean;
};

type Item = Record<string, string | number | null | undefined>;

type ListSectionProps = {
  title: string;
  empty: string;
  items: Item[];
  fields: FieldSpec[];
  max: number;
  render: (item: Item) => ReactNode;
  validate?: (values: Record<string, string>) => Record<string, string>;
  onSave: (items: Item[]) => Promise<void>;
};

/** Editable profile list (languages, experience, education...): add, edit and delete rows in a dialog, up to `max`, saved together. */
export function ListSection({ title, empty, items, fields, max, render, validate, onSave }: ListSectionProps) {
  const t = useTranslations("ProfileEditor");
  const [editing, setEditing] = useState<{ index: number | null; values: Record<string, string> } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const open = (index: number | null) => {
    const source = index === null ? {} : items[index];
    setEditing({ index, values: Object.fromEntries(fields.map((field) => [field.key, source[field.key] == null ? "" : String(source[field.key])])) });
    setErrors({});
    setError(null);
  };

  const persist = async (next: Item[]) => {
    setBusy(true);
    setError(null);
    try {
      await onSave(next);
      setEditing(null);
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(firstError(apiError.fields) ?? apiError.message ?? t("failed"));
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!editing) return;
    const found = {
      ...(validate?.(editing.values) ?? {}),
      ...Object.fromEntries(fields.filter((field) => field.required && !editing.values[field.key]?.trim()).map((field) => [field.key, t("required")])),
    };
    setErrors(found);
    if (Object.keys(found).length) return;
    const item: Item = Object.fromEntries(
      fields.map((field) => {
        const raw = editing.values[field.key]?.trim() ?? "";
        return [field.key, raw === "" ? null : field.type === "number" ? Number(raw) : raw];
      }),
    );
    void persist(editing.index === null ? [...items, item] : items.map((current, index) => (index === editing.index ? item : current)));
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold">{title}</h2>
        {items.length < max && (
          <button type="button" onClick={() => open(null)} className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            <Plus className="size-4" />
            {t("add")}
          </button>
        )}
      </div>
      {items.length ? (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 py-2.5">
              <div className="min-w-0 flex-1 text-sm">{render(item)}</div>
              <button type="button" aria-label={t("edit")} onClick={() => open(index)} className="text-muted hover:text-brand">
                <Pencil className="size-4" />
              </button>
              <button type="button" aria-label={t("delete")} onClick={() => persist(items.filter((_, position) => position !== index))} className="text-muted hover:text-danger">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
      {error && !editing && <p className="text-sm text-danger">{error}</p>}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} showClose title={title}>
        {editing && (
          <div className="flex w-full flex-col gap-4 text-start">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) =>
                field.type === "select" ? (
                  <Select
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    value={editing.values[field.key]}
                    placeholder={t("choose")}
                    options={field.options ?? []}
                    error={errors[field.key]}
                    className={field.wide ? "sm:col-span-2" : ""}
                    onChange={(event) => setEditing({ ...editing, values: { ...editing.values, [field.key]: event.target.value } })}
                  />
                ) : (
                  <Field
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    type={field.type ?? "text"}
                    dir={field.type === "url" || field.type === "number" ? "ltr" : undefined}
                    value={editing.values[field.key]}
                    error={errors[field.key]}
                    className={field.wide ? "sm:col-span-2" : ""}
                    onChange={(event) => setEditing({ ...editing, values: { ...editing.values, [field.key]: event.target.value } })}
                  />
                ),
              )}
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex justify-center gap-3">
              <Button variant="outline" font="button" onClick={() => setEditing(null)}>
                {t("cancel")}
              </Button>
              <Button variant="solid" font="button" loading={busy} onClick={submit}>
                {t("save")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
