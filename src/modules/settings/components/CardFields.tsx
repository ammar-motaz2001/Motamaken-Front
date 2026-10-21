"use client";

import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/Field";
import { formatCardNumber, formatExpiry, type CardForm } from "../lib/card";

/** Row of accepted card brands shown above the card form. */
function CardBrands() {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {["VISA", "MC", "AMEX", "mada"].map((brand) => (
        <span key={brand} className="rounded border border-border px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted">
          {brand}
        </span>
      ))}
    </div>
  );
}

type CardFieldsProps = {
  card: CardForm;
  errors: Partial<Record<keyof CardForm, string>>;
  onChange: (card: CardForm) => void;
};

/** Card holder, number, expiry and CVC inputs, formatted as the user types, with per-field errors. */
export function CardFields({ card, errors, onChange }: CardFieldsProps) {
  const t = useTranslations("Settings.payment.card");
  const set = (key: keyof CardForm, value: string) => onChange({ ...card, [key]: value });

  return (
    <div className="flex w-full flex-col gap-4 text-start">
      <CardBrands />
      <Field
        label={t("holderName")}
        placeholder={t("holderNamePlaceholder")}
        autoComplete="cc-name"
        value={card.holderName}
        error={errors.holderName && t("errors.holderName")}
        trailing={<CreditCard className="size-4 shrink-0 text-muted" aria-hidden />}
        onChange={(event) => set("holderName", event.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <Field
          label={t("number")}
          placeholder="•••• •••• •••• ••••"
          inputMode="numeric"
          autoComplete="cc-number"
          dir="ltr"
          value={card.number}
          error={errors.number && t("errors.number")}
          onChange={(event) => set("number", formatCardNumber(event.target.value))}
        />
        <Field
          label={t("expiry")}
          placeholder="MM/YY"
          inputMode="numeric"
          autoComplete="cc-exp"
          dir="ltr"
          value={card.expiry}
          error={errors.expiry && t("errors.expiry")}
          onChange={(event) => set("expiry", formatExpiry(event.target.value))}
        />
        <Field
          label={t("cvc")}
          placeholder="•••"
          inputMode="numeric"
          autoComplete="cc-csc"
          dir="ltr"
          type="password"
          maxLength={4}
          value={card.cvc}
          error={errors.cvc && t("errors.cvc")}
          onChange={(event) => set("cvc", event.target.value.replace(/\D/g, ""))}
        />
      </div>
    </div>
  );
}
