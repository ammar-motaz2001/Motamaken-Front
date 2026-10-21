"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PolicyCheckbox } from "@/components/policy/PolicyCheckbox";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { PaymentMethod } from "@/lib/api/types";
import { CardError, moyasarEnabled, open3dsWindow, saveTokenizedCard } from "@/lib/moyasar";
import { EMPTY_CARD, toCardPayload, validateCard, type CardForm } from "../lib/card";
import { CardFields } from "./CardFields";

type Step = "form" | "success" | "error";

/**
 * Add a card or PayPal account (POST /me/payment-methods). With Moyasar on, the card goes to Moyasar from the browser,
 * passes 3-D Secure in a pop-up, and only its token reaches the API.
 */
export function AddPaymentMethodModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (method: PaymentMethod) => void }) {
  const t = useTranslations("Settings.payment");
  const [type, setType] = useState<"card" | "paypal">("card");
  const [card, setCard] = useState<CardForm>(EMPTY_CARD);
  const [email, setEmail] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>("form");
  const [failure, setFailure] = useState("");
  const [saving, setSaving] = useState(false);

  const close = () => {
    setStep("form");
    setCard(EMPTY_CARD);
    setEmail("");
    setErrors({});
    setAgreed(false);
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> =
      type === "card" ? validateCard(card) : /^\S+@\S+\.\S+$/.test(email) ? {} : { email: "email" };
    if (!agreed) found.agreed = "agreed";
    setErrors(found);
    if (Object.keys(found).length) return;

    // The bank's one-time card check opens in a small window, which must open right here in the click.
    const popup = type === "card" && moyasarEnabled ? open3dsWindow() : null;
    setSaving(true);
    try {
      const body = type === "card" ? { ...toCardPayload(card), makeDefault } : { type, email, makeDefault };
      // With Moyasar the card goes to Moyasar from the browser; the API only receives a token.
      const { data } =
        type === "card" && moyasarEnabled
          ? await saveTokenizedCard(card, popup, makeDefault)
          : await api<{ data: PaymentMethod }>("/me/payment-methods", { method: "POST", body });
      onSaved(data);
      setStep("success");
    } catch (caught) {
      if (caught instanceof CardError) {
        if (Object.keys(caught.fields).length) {
          setErrors(caught.fields);
        } else {
          setFailure(caught.message);
          setStep("error");
        }
        return;
      }
      const apiError = caught as ApiError;
      const fields = apiError.fields;
      if (Object.keys(fields).length) {
        setErrors({
          ...(fields.holderName && { holderName: "x" }),
          ...(fields.number && { number: "x" }),
          ...((fields.expMonth || fields.expYear) && { expiry: "x" }),
          ...(fields.cvc && { cvc: "x" }),
          ...(fields.email && { email: "x" }),
        });
      } else {
        setFailure(apiError.message ?? "");
        setStep("error");
      }
    } finally {
      setSaving(false);
    }
  };

  if (step === "success") {
    return (
      <ResultModal open={open} onClose={close} type="success" title={t("added.title")} message={t("added.message")}>
        <Button variant="solid" font="button" onClick={close}>
          {t("added.back")}
        </Button>
      </ResultModal>
    );
  }

  if (step === "error") {
    return (
      <ResultModal open={open} onClose={close} type="error" title={t("add.title")} message={failure || t("add.failed")}>
        <Button variant="outlineOrange" font="button" onClick={close}>
          {t("add.backToSettings")}
        </Button>
        <Button variant="orange" font="button" onClick={() => setStep("form")}>
          {t("add.tryAgain")}
        </Button>
      </ResultModal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      showClose
      title={
        <span className="flex flex-col gap-1 text-start">
          {t("add.title")}
          <span className="text-sm font-normal text-muted">{t("add.subtitle")}</span>
        </span>
      }
    >
      <form onSubmit={submit} noValidate className="flex w-full flex-col gap-5 text-start">
        <div role="radiogroup" aria-label={t("add.type")} className="grid grid-cols-2 gap-3">
          {(["card", "paypal"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={type === option}
              onClick={() => setType(option)}
              className={`rounded-lg border px-4 py-3 text-sm font-bold ${type === option ? "border-brand bg-brand-soft text-brand" : "border-border"}`}
            >
              {t(`types.${option}`)}
            </button>
          ))}
        </div>

        {type === "card" ? (
          <CardFields card={card} errors={errors} onChange={(next) => (setCard(next), setErrors({}))} />
        ) : (
          <Field
            label={t("paypalEmail")}
            type="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            error={errors.email && t("card.errors.email")}
            onChange={(event) => (setEmail(event.target.value), setErrors({}))}
          />
        )}

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={makeDefault} onChange={(event) => setMakeDefault(event.target.checked)} className="size-4 accent-brand" />
          {t("add.makeDefault")}
        </label>
        <PolicyCheckbox checked={agreed} invalid={Boolean(errors.agreed)} onChange={setAgreed}>
          {(link) => t.rich("add.agree", { link })}
        </PolicyCheckbox>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" font="button" onClick={close}>
            {t("cancel")}
          </Button>
          <Button type="submit" variant="solid" font="button" loading={saving}>
            {t("add.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
