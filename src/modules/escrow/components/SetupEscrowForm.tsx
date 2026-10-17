"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Escrow } from "@/lib/api/types";
import { DateField } from "@/components/ui/DatePicker";
import { useMoney } from "../lib/useMoney";

type Row = { title: string; amount: string; dueDate: string };

export function SetupEscrowForm({ projectId, total, currency, onCreated }: { projectId: number; total: number; currency: string; onCreated: (escrow: Escrow) => void }) {
  const t = useTranslations("Escrow.setup");
  const money = useMoney(currency);
  const [rows, setRows] = useState<Row[]>([{ title: "", amount: String(total), dueDate: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sum = Math.round(rows.reduce((value, row) => value + (Number(row.amount) || 0), 0) * 100) / 100;
  const matches = sum === total;

  const update = (index: number, key: keyof Row, value: string) => {
    setRows((current) => current.map((row, position) => (position === index ? { ...row, [key]: value } : row)));
    setErrors({});
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> = {};
    rows.forEach((row, index) => {
      if (row.title.trim().length < 2) found[`milestones.${index}.title`] = t("titleRequired");
      if (!(Number(row.amount) > 0)) found[`milestones.${index}.amount`] = t("amountRequired");
    });
    setErrors(found);
    if (Object.keys(found).length || !matches) return;

    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: Escrow }>(`/projects/${projectId}/escrow`, {
        method: "POST",
        body: { milestones: rows.map((row) => ({ title: row.title.trim(), amount: Number(row.amount), dueDate: row.dueDate || null })) },
      });
      onCreated(data);
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError(apiError.message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("intro", { total: money(total) })}</p>
      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <li key={index} className="grid items-start gap-3 rounded-lg border border-border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <Field
              label={t("milestone", { number: index + 1 })}
              placeholder={t("titlePlaceholder")}
              value={row.title}
              error={errors[`milestones.${index}.title`]}
              onChange={(event) => update(index, "title", event.target.value)}
            />
            <Field
              label={t("amount")}
              type="number"
              min={0}
              step="0.01"
              dir="ltr"
              value={row.amount}
              error={errors[`milestones.${index}.amount`]}
              onChange={(event) => update(index, "amount", event.target.value)}
            />
            <DateField label={t("dueDate")} value={row.dueDate} error={errors[`milestones.${index}.dueDate`]} onChange={(value) => update(index, "dueDate", value)} min={new Date().toISOString().slice(0, 10)} />
            <button
              type="button"
              aria-label={t("remove")}
              disabled={rows.length === 1}
              onClick={() => setRows((current) => current.filter((_, position) => position !== index))}
              className="mt-8 flex size-9 items-center justify-center rounded-md border border-border text-danger disabled:opacity-30"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setRows((current) => [...current, { title: "", amount: String(Math.max(0, Math.round((total - sum) * 100) / 100)), dueDate: "" }])}
          className="flex items-center gap-1.5 text-sm font-medium text-brand"
        >
          <Plus className="size-4" />
          {t("add")}
        </button>
        <span className={`text-sm font-bold ${matches ? "text-brand" : "text-danger"}`} role="status">
          {t("sum", { sum: money(sum), total: money(total) })}
        </span>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" variant="solid" font="button" loading={busy} disabled={!matches} className="self-end">
        {t("submit")}
      </Button>
    </form>
  );
}
