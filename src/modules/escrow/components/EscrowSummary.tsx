"use client";

import { useTranslations } from "next-intl";
import type { Escrow } from "@/lib/api/types";
import { useMoney } from "../lib/useMoney";

/** Escrow totals (total, held, released, refunded) and a bar of how much has been paid out or refunded. */
export function EscrowSummary({ escrow }: { escrow: Escrow }) {
  const t = useTranslations("Escrow.summary");
  const money = useMoney(escrow.currency);
  const { total, held, released, refunded } = escrow.totals;
  const progress = total ? Math.round(((released + refunded) / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(
          [
            ["total", total, "text-foreground"],
            ["held", held, "text-orange"],
            ["released", released, "text-brand"],
            ["refunded", refunded, "text-muted"],
          ] as const
        ).map(([key, value, tone]) => (
          <div key={key} className="rounded-lg border border-border p-3">
            <dt className="text-xs text-muted">{t(key)}</dt>
            <dd dir="ltr" className={`text-start text-lg font-bold ${tone}`}>
              {money(value)}
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>{t("progress")}</span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("progress")}
        >
          <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
