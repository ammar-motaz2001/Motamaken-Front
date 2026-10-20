"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { PointRule } from "../types";
import { inputClasses } from "./ActionButton";
import { SaveBar } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

/** What each action is worth in points. */
export function PointRulesEditor({ rules }: { rules: PointRule[] }) {
  const t = useTranslations("Admin.points");
  const { busy, error, saved, save } = useAdminSave();
  const [amounts, setAmounts] = useState(() => Object.fromEntries(rules.map((r) => [r.reason, String(r.amount)])));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await save("/admin/points/rules", "PUT", { rules: Object.fromEntries(Object.entries(amounts).map(([reason, amount]) => [reason, { amount: Number(amount || 0) }])) });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <ul className="grid gap-2 sm:grid-cols-2">
        {rules.map((rule) => (
          <li key={rule.reason} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="min-w-0">
              <span className="block text-sm font-medium">{rule.label}</span>
              <span className="text-xs text-muted">{rule.once ? t("once") : t("everyTime")}</span>
            </span>
            <input
              type="number"
              min="0"
              aria-label={rule.label}
              value={amounts[rule.reason]}
              onChange={(e) => setAmounts((all) => ({ ...all, [rule.reason]: e.target.value }))}
              className={`${inputClasses} w-24 text-center`}
            />
          </li>
        ))}
      </ul>
      <SaveBar busy={busy} error={error} saved={saved} />
    </form>
  );
}
