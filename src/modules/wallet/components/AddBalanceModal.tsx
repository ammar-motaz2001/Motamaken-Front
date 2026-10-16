"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api/client";
import { CardError, cardDeposit, moyasarEnabled, open3dsWindow } from "@/lib/moyasar";
import type { ApiError } from "@/lib/api/errors";
import type { Deposit, PaymentMethod } from "@/lib/api/types";
import { CardFields } from "@/modules/settings";
import { EMPTY_CARD, toCardPayload, validateCard, type CardForm } from "@/modules/settings/lib/card";
import { ProcessingScreen } from "./ProcessingScreen";

// With Moyasar every card (Visa, Mastercard, mada) goes through the card form; the other methods need their own contracts.
const METHODS = moyasarEnabled ? (["card"] as const) : (["card", "mada", "apple_pay", "bank_transfer"] as const);
const SIMULATE = process.env.NEXT_PUBLIC_PAYMENTS_SIMULATE === "true";

type Step = "amount" | "method" | "processing" | "success" | "error";

type AddBalanceModalProps = {
  open: boolean;
  onClose: () => void;
  onDone: (deposit: Deposit) => void;
  currencies: string[];
  currency: string;
};

export function AddBalanceModal({ open, onClose, onDone, currencies, currency: initialCurrency }: AddBalanceModalProps) {
  const t = useTranslations("Wallet.add");
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(initialCurrency);
  const [method, setMethod] = useState<(typeof METHODS)[number]>("card");
  const [saved, setSaved] = useState<PaymentMethod[]>([]);
  const [cardId, setCardId] = useState("new");
  const [card, setCard] = useState<CardForm>(EMPTY_CARD);
  const [saveCard, setSaveCard] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [deposit, setDeposit] = useState<Deposit | null>(null);

  useEffect(() => {
    if (!open) return;
    api<{ data: PaymentMethod[] }>("/me/payment-methods")
      .then(({ data }) => {
        const cards = data.filter((item) => item.type === "card");
        setSaved(cards);
        setCardId(String(cards.find((item) => item.isDefault)?.id ?? cards[0]?.id ?? "new"));
      })
      .catch(() => setSaved([]));
  }, [open]);

  const close = () => {
    setStep("amount");
    setAmount("");
    setCard(EMPTY_CARD);
    setErrors({});
    onClose();
  };

  const toMethod = (event: FormEvent) => {
    event.preventDefault();
    if (!(Number(amount) > 0)) {
      setErrors({ amount: t("amountRequired") });
      return;
    }
    setErrors({});
    setStep("method");
  };

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    const newCard = method === "card" && cardId === "new";
    if (newCard) {
      const found = validateCard(card);
      setErrors(found);
      if (Object.keys(found).length) return;
    }

    if (moyasarEnabled) {
      const popup = open3dsWindow();
      setStep("processing");
      try {
        const paid = await cardDeposit({
          amount: Number(amount),
          currency,
          popup,
          ...(newCard ? { card, saveCard } : { savedCardId: Number(cardId) }),
        });
        setDeposit(paid);
        setFailure(paid.failureReason ?? "");
        setStep(paid.status === "succeeded" ? "success" : "error");
        if (paid.status === "succeeded") onDone(paid);
      } catch (caught) {
        if (caught instanceof CardError) {
          setErrors(caught.fields);
          setFailure(caught.message);
          setStep(Object.keys(caught.fields).length ? "method" : "error");
          return;
        }
        const apiError = caught as ApiError;
        if (apiError.fields?.amount || apiError.code?.startsWith("amount_")) {
          setErrors({ amount: apiError.fields.amount ?? apiError.message ?? "" });
          setStep("amount");
          return;
        }
        setFailure(apiError.message ?? "");
        setStep("error");
      }
      return;
    }

    setStep("processing");
    try {
      if (newCard && saveCard) await api("/me/payment-methods", { method: "POST", body: toCardPayload(card) });
      const { data } = await api<{ data: Deposit }>("/wallet/deposits", {
        method: "POST",
        body: { amount: Number(amount), currency, method },
      });
      if (!SIMULATE && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      const { data: paid } = await api<{ data: Deposit }>(`/wallet/deposits/${data.id}/simulate`, { method: "POST" });
      setDeposit(paid);
      setStep(paid.status === "succeeded" ? "success" : "error");
      if (paid.status === "succeeded") onDone(paid);
    } catch (caught) {
      const apiError = caught as ApiError;
      if (apiError.fields.amount || apiError.code?.startsWith("amount_")) {
        setErrors({ amount: apiError.fields.amount ?? apiError.message ?? "" });
        setStep("amount");
        return;
      }
      setFailure(apiError.message ?? "");
      setStep("error");
    }
  };

  if (!open) return null;
  if (step === "processing") return <ProcessingScreen />;

  if (step === "success") {
    return (
      <ResultModal
        open
        onClose={close}
        type="success"
        title={t("title")}
        message={t("success", { amount: deposit?.amount ?? 0, currency: deposit?.currency ?? currency })}
      >
        <Button variant="solid" font="button" onClick={close}>
          {t("backToWallet")}
        </Button>
      </ResultModal>
    );
  }

  if (step === "error") {
    return (
      <ResultModal open onClose={close} type="error" title={t("title")} message={failure || t("failed")}>
        <Button variant="outlineOrange" font="button" onClick={close}>
          {t("backToWallet")}
        </Button>
        <Button variant="orange" font="button" onClick={() => setStep("method")}>
          {t("tryAgain")}
        </Button>
      </ResultModal>
    );
  }

  const header = (
    <span className="flex flex-col gap-1 text-start">
      {t(step === "amount" ? "title" : "methodTitle")}
      <span className="text-sm font-normal text-muted">{t(step === "amount" ? "subtitle" : "methodSubtitle")}</span>
    </span>
  );

  if (step === "amount") {
    return (
      <Modal open onClose={close} showClose title={header}>
        <form onSubmit={toMethod} noValidate className="flex w-full flex-col gap-5 text-start">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Field
              label={t("amount")}
              required
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              dir="ltr"
              autoFocus
              value={amount}
              error={errors.amount}
              onChange={(event) => (setAmount(event.target.value), setErrors({}))}
            />
            <Select label={t("currency")} value={currency} options={currencies.map((code) => ({ value: code, label: code }))} onChange={(event) => setCurrency(event.target.value)} />
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline" font="button" onClick={close}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="solid" font="button">
              {t("next")}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal open onClose={close} showClose title={header}>
      <form onSubmit={pay} noValidate className="flex w-full flex-col gap-5 text-start">
        <div role="radiogroup" aria-label={t("method")} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {METHODS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={method === option}
              onClick={() => setMethod(option)}
              className={`rounded-lg border px-3 py-3 text-sm font-bold ${method === option ? "border-brand bg-brand-soft text-brand" : "border-border"}`}
            >
              {t(`methods.${option}`)}
            </button>
          ))}
        </div>

        {method === "card" && (
          <>
            <Select
              label={t("savedCards")}
              value={cardId}
              options={[
                ...saved.map((item) => ({ value: String(item.id), label: `${item.brand?.toUpperCase()} •••• ${item.last4}` })),
                { value: "new", label: t("newCard") },
              ]}
              onChange={(event) => setCardId(event.target.value)}
            />
            {!saved.length && <p className="-mt-3 text-xs text-muted">{t("noSavedCards")}</p>}
            {cardId === "new" && (
              <>
                <CardFields card={card} errors={errors} onChange={(next) => (setCard(next), setErrors({}))} />
                <label className="flex items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={saveCard} onChange={(event) => setSaveCard(event.target.checked)} className="size-4 accent-brand" />
                  {t("saveCard")}
                </label>
              </>
            )}
          </>
        )}
        {method !== "card" && <p className="rounded-lg bg-surface-muted p-3 text-sm text-muted">{t("redirectNote")}</p>}
        {moyasarEnabled && <p className="text-xs text-muted">{t("secureNote")}</p>}

        <div className="rounded-lg bg-surface-muted p-3 text-sm">
          <div className="flex justify-between font-bold">
            <span className="text-orange">{t("total")}</span>
            <span dir="ltr">
              {Number(amount).toFixed(2)} {currency}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" font="button" onClick={() => setStep("amount")}>
            {t("back")}
          </Button>
          <Button type="submit" variant="solid" font="button">
            {t("payNow")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
