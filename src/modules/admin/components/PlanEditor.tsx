"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { money } from "../lib";
import type { AdminPlan } from "../types";
import { SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

const feature = (plan: AdminPlan, key: string) => {
  const value = Array.isArray(plan.features) ? undefined : plan.features[key];
  return value === null || value === undefined ? "" : String(value);
};

export function PlanEditor({ plan }: { plan: AdminPlan }) {
  const t = useTranslations("Admin.plans");
  const locale = useLocale();
  const { busy, error, fields, saved, save } = useAdminSave();
  const [price, setPrice] = useState(String(plan.price));
  const [popular, setPopular] = useState(plan.isPopular);
  const [active, setActive] = useState(plan.isActive ?? true);
  const [offers, setOffers] = useState(feature(plan, "monthly_offers"));
  const [fee, setFee] = useState(feature(plan, "fee_percent"));
  const [discount, setDiscount] = useState(feature(plan, "promotion_discount_percent"));
  const [support, setSupport] = useState(feature(plan, "priority_support") === "true");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nullable = (value: string) => (value === "" ? null : Number(value));
    void save(`/admin/plans/${plan.id}`, "PATCH", {
      price: Number(price),
      isPopular: popular,
      isActive: active,
      features: { monthly_offers: nullable(offers), fee_percent: nullable(fee), promotion_discount_percent: nullable(discount), priority_support: support },
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold">{plan.name}</p>
          <p className="text-xs text-muted">
            {t(`audience.${plan.audience}`)} · {plan.code} · {t("subscribers", { count: plan.subscribers })}
          </p>
        </div>
        <div className="flex gap-1.5">
          {plan.isPopular && <StatusPill tone="warning">{t("popular")}</StatusPill>}
          <StatusPill tone={plan.isActive === false ? "danger" : "success"}>{plan.isActive === false ? t("off") : t("on")}</StatusPill>
        </div>
      </div>
      <p className="text-2xl font-bold text-brand">{plan.isFree ? t("free") : money(plan.price, plan.currency, locale)}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label={t("price", { currency: plan.currency })} type="number" step="0.01" value={price} onChange={setPrice} error={fields.price} required />
        <TextInput label={t("monthlyOffers")} hint={t("unlimitedHint")} type="number" value={offers} onChange={setOffers} error={fields["features.monthly_offers"]} />
        <TextInput label={t("feePercent")} type="number" step="0.01" value={fee} onChange={setFee} error={fields["features.fee_percent"]} />
        <TextInput label={t("promotionDiscount")} type="number" step="0.01" value={discount} onChange={setDiscount} error={fields["features.promotion_discount_percent"]} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        {[
          [t("isActive"), active, setActive],
          [t("isPopular"), popular, setPopular],
          [t("prioritySupport"), support, setSupport],
        ].map(([label, checked, set]) => (
          <label key={label as string} className="flex items-center gap-2">
            <input type="checkbox" checked={checked as boolean} onChange={(event) => (set as (value: boolean) => void)(event.target.checked)} className="size-4 accent-brand" />
            {label as string}
          </label>
        ))}
      </div>
      {plan.perks.length > 0 && (
        <ul className="list-inside list-disc text-xs text-muted">
          {plan.perks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
      )}
      <SaveBar busy={busy} error={error} saved={saved} />
    </form>
  );
}
