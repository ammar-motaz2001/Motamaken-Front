"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { AdminCurrency } from "../types";
import { inputClasses } from "./ActionButton";
import { SaveBar } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

const iconButton = "flex size-8 shrink-0 items-center justify-center rounded border border-border hover:border-brand disabled:opacity-30";

/**
 * The marketplace's currencies in display order: switch one on or off, rename it, add one by ISO code. A currency users
 * hold money in cannot be switched off or removed (the API refuses it too).
 */
export function CurrenciesEditor({ currencies }: { currencies: AdminCurrency[] }) {
  const t = useTranslations("Admin.currencies");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [list, setList] = useState(currencies);

  const update = (index: number, patch: Partial<AdminCurrency>) => setList((current) => current.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const move = (from: number, to: number) =>
    setList((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await save("/admin/currencies", "PUT", {
      currencies: list.map(({ code, symbol, nameEn, nameAr, active, rate }) => ({ code: code.trim().toUpperCase(), symbol, nameEn, nameAr, active, rate: Number(rate) || 1 })),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {list.map((currency, index) => {
          const rowError = ["code", "symbol", "nameEn", "nameAr", "rate"].map((field) => fields[`currencies.${index}.${field}`]).find(Boolean);
          return (
            <li key={index} className={`flex flex-col gap-1 rounded-lg border p-3 ${currency.active ? "border-border" : "border-dashed border-border opacity-70"}`}>
              <div className="grid items-center gap-2 sm:grid-cols-[auto_90px_80px_1fr_1fr_auto]">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={currency.active}
                    disabled={currency.inUse && currency.active}
                    onChange={(e) => update(index, { active: e.target.checked })}
                    className="size-4 accent-brand"
                  />
                  {currency.active ? t("on") : t("off")}
                </label>
                <input dir="ltr" aria-label={t("code")} placeholder="KWD" maxLength={3} value={currency.code} readOnly={currency.inUse} onChange={(e) => update(index, { code: e.target.value.toUpperCase() })} className={`${inputClasses} font-mono uppercase`} />
                <input dir="ltr" aria-label={t("symbol")} placeholder={t("symbol")} value={currency.symbol} onChange={(e) => update(index, { symbol: e.target.value })} className={inputClasses} />
                <input dir="ltr" aria-label={t("nameEn")} placeholder={t("nameEn")} value={currency.nameEn} onChange={(e) => update(index, { nameEn: e.target.value })} className={inputClasses} />
                <input
                  dir="ltr"
                  type="number"
                  min="0"
                  step="any"
                  aria-label={t("rate")}
                  title={t("rateHint")}
                  placeholder={t("rate")}
                  disabled={currency.code === "USD"}
                  value={currency.code === "USD" ? 1 : currency.rate}
                  onChange={(e) => update(index, { rate: Number(e.target.value) })}
                  className={inputClasses}
                />
                <input dir="rtl" aria-label={t("nameAr")} placeholder={t("nameAr")} value={currency.nameAr} onChange={(e) => update(index, { nameAr: e.target.value })} className={inputClasses} />
                <span className="flex gap-1">
                  <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={t("moveUp")} className={iconButton}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" disabled={index === list.length - 1} onClick={() => move(index, index + 1)} aria-label={t("moveDown")} className={iconButton}>
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" disabled={currency.inUse} onClick={() => setList((current) => current.filter((_, i) => i !== index))} aria-label={t("remove")} className={`${iconButton} text-danger`}>
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>
              {currency.inUse && <p className="text-xs text-muted">{t("inUse")}</p>}
              {rowError && <p className="text-xs text-danger">{rowError}</p>}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => setList((current) => [...current, { code: "", symbol: "", nameEn: "", nameAr: "", active: true, inUse: false, rate: 1 }])}
        className="inline-flex h-9 items-center gap-1 self-start rounded-md border border-dashed border-border px-3 text-sm font-semibold hover:border-brand"
      >
        <Plus className="size-4" /> {t("add")}
      </button>
      <SaveBar busy={busy} error={error} saved={saved} />
    </form>
  );
}
