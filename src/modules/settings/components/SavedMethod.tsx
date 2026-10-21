"use client";

import { CircleCheck, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PaymentMethod } from "@/lib/api/types";

/** One saved card (masked number, brand, expiry) or PayPal account, drawn as a small card with a remove button. */
export function SavedMethod({ method, onRemove }: { method: PaymentMethod; onRemove: () => void }) {
  const t = useTranslations("Settings.payment");
  const isCard = method.type === "card";

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex w-full max-w-[300px] flex-col gap-3 rounded-xl border border-border bg-surface-muted p-4 shadow-card">
        <div className="flex items-start justify-between gap-2">
          <div dir="ltr" className="font-mono text-sm tracking-widest">
            {isCard ? `•••• •••• •••• ${method.last4}` : method.email}
          </div>
          <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-bold uppercase">{isCard ? method.brand : "PayPal"}</span>
        </div>
        {isCard && (
          <div className="flex justify-between gap-2 text-xs">
            <span>
              <span className="block font-bold uppercase">{method.holderName}</span>
              <span className="text-muted">{t("card.holderName")}</span>
            </span>
            <span dir="ltr" className="text-end">
              <span className="block font-bold">
                {String(method.expMonth).padStart(2, "0")}/{String(method.expYear).slice(-2)}
              </span>
              <span className="text-muted">{t("card.expiry")}</span>
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center gap-1.5 rounded-md border border-danger px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft"
        >
          <Trash2 className="size-3.5" />
          {t("remove.button")}
        </button>
      </div>
      {method.isDefault && (
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand uppercase">
          <CircleCheck className="size-4" />
          {t("preferred")}
        </span>
      )}
    </div>
  );
}
