"use client";

import { Rocket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import type { PromotionPackage } from "./types";
import { buttonClasses } from "@/components/ui/Button";

type PackagesStepProps = { currency: string; intro: string; illustration?: ReactNode; onChoose: (item: PromotionPackage) => void };

/** Promotion packages with price, length and reach, from GET /promotions/packages in the user's currency. */
export function PackagesStep({ currency, intro, illustration, onChoose }: PackagesStepProps) {
  const t = useTranslations("Promotions.packages");
  const locale = useLocale();
  const [packages, setPackages] = useState<PromotionPackage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const number = (value: number) => new Intl.NumberFormat(locale, { notation: "compact" }).format(value);

  useEffect(() => {
    api<{ data: PromotionPackage[] }>(`/promotions/packages?currency=${currency}`)
      .then(({ data }) => setPackages(data))
      .catch(() => setFailed(true));
  }, [currency]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-start sm:flex-row">
        <p className="flex-1 text-sm leading-relaxed">{intro}</p>
        {illustration ?? <Rocket className="size-20 shrink-0 -rotate-12 text-brand" strokeWidth={1.2} aria-hidden />}
      </div>
      {failed && <p className="text-sm text-danger">{t("failed")}</p>}
      <ul className="grid gap-3 sm:grid-cols-3">
        {(packages ?? []).map((item, index) => (
          <li
            key={item.code}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 shadow-card ${index === 2 ? "border-brand" : "border-border"}`}
          >
            <span className="text-xs font-bold">{t(`names.${item.code}`)}</span>
            <span dir="ltr" className="text-3xl font-medium">
              {new Intl.NumberFormat(locale, { style: "currency", currency: item.currency }).format(item.price)}
            </span>
            <span className="text-xs">{t("days", { count: item.days })}</span>
            <span className="text-xs">{t("reach", { min: number(item.reach.min), max: number(item.reach.max) })}</span>
            <button
              type="button"
              onClick={() => onChoose(item)}
              className={`${buttonClasses({ size: "sm" })} mt-1 w-full`}
            >
              {t("payNow")}
            </button>
          </li>
        ))}
        {!packages && !failed && [0, 1, 2].map((key) => <li key={key} className="h-40 animate-pulse rounded-xl bg-surface-muted" />)}
      </ul>
    </div>
  );
}
