"use client";

import { CircleCheck, CreditCard, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PolicyCheckbox } from "@/components/policy/PolicyCheckbox";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api/client";
import { CardError, cardDeposit } from "@/lib/moyasar";
import { useMoyasarEnabled } from "@/components/providers/PaymentsProvider";
import type { ApiError } from "@/lib/api/errors";
import type { Deposit, PaymentMethod, WalletBalance } from "@/lib/api/types";
import { CardFields } from "@/modules/settings";
import { EMPTY_CARD, toCardPayload, validateCard, type CardForm } from "@/modules/settings/lib/card";
import { AddBalanceModal, FeedbackModal, ProcessingScreen, type FeedbackContext } from "@/modules/wallet";

const SIMULATE = process.env.NEXT_PUBLIC_PAYMENTS_SIMULATE === "true";

type Step = "summary" | "method" | "processing" | "success" | "error" | "feedback";

type PayModalProps = {
  open: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  rows: { label: string; value: ReactNode }[];
  pay: () => Promise<number | undefined>;
  success: { message: ReactNode; actions: (close: () => void) => ReactNode };
  errorActions: (close: () => void, retry: () => void) => ReactNode;
  feedbackContext: FeedbackContext;
};

/**
 * Checkout dialog for any purchase: summary, then pay from the wallet balance or a card (topping up the wallet first,
 * with 3-D Secure), then success, error and a short feedback step.
 */
export function PayModal({ open, onClose, amount, currency, rows, pay, success, errorActions, feedbackContext }: PayModalProps) {
  const moyasarEnabled = useMoyasarEnabled();
  const t = useTranslations("Payments");
  const locale = useLocale();
  const [step, setStep] = useState<Step>("summary");
  const [method, setMethod] = useState<"card" | "balance">("balance");
  const [available, setAvailable] = useState<number | null>(null);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [cardId, setCardId] = useState("new");
  const [card, setCard] = useState<CardForm>(EMPTY_CARD);
  const [saveCard, setSaveCard] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [referenceId, setReferenceId] = useState<number>();
  const [topUp, setTopUp] = useState(false);
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  const short = available !== null && available < amount;

  const loadBalance = () =>
    api<{ data: WalletBalance[] }>("/wallet")
      .then(({ data }) => setAvailable(data.find((row) => row.currency === currency)?.available ?? 0))
      .catch(() => setAvailable(0));

  useEffect(() => {
    if (step !== "method") return;
    void loadBalance();
    api<{ data: PaymentMethod[] }>("/me/payment-methods")
      .then(({ data }) => {
        const saved = data.filter((item) => item.type === "card");
        setCards(saved);
        setCardId(String(saved.find((item) => item.isDefault)?.id ?? saved[0]?.id ?? "new"));
      })
      .catch(() => setCards([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currency]);

  const reset = () => {
    setStep("summary");
    setCard(EMPTY_CARD);
    setErrors({});
    setAgreed(false);
    setFailure("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const finish = () => setStep("feedback");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> = method === "card" && cardId === "new" ? validateCard(card) : {};
    if (method === "card" && !agreed) found.agreed = "agreed";
    if (method === "balance" && short) return;
    setErrors(found);
    if (Object.keys(found).length) return;

    // Card: top the wallet up with exactly the amount first (3-D Secure in a small window), then pay from the wallet.
    const popup = null;
    setStep("processing");
    try {
      if (method === "card" && moyasarEnabled) {
        const deposit = await cardDeposit({ amount, currency, popup, forPurchase: true, ...(cardId === "new" ? { card, saveCard } : { savedCardId: Number(cardId) }) });
        if (deposit.status !== "succeeded") {
          setFailure(deposit.failureReason || t("failed"));
          setStep("error");
          return;
        }
      } else if (method === "card") {
        if (cardId === "new" && saveCard) await api("/me/payment-methods", { method: "POST", body: toCardPayload(card) });
        const { data } = await api<{ data: Deposit }>("/wallet/deposits", { method: "POST", body: { amount, currency, method: "card", purpose: "purchase" } });
        if (!SIMULATE && data.checkoutUrl) {
          window.location.assign(data.checkoutUrl);
          return;
        }
        await api(`/wallet/deposits/${data.id}/simulate`, { method: "POST" });
      }
      setReferenceId(await pay());
      setStep("success");
    } catch (caught) {
      if (caught instanceof CardError && Object.keys(caught.fields).length) {
        setErrors(caught.fields);
        setStep("method");
        return;
      }
      setFailure((caught as ApiError).message ?? "");
      setStep("error");
    }
  };

  if (!open) return null;
  if (step === "processing") return <ProcessingScreen />;
  if (step === "feedback") return <FeedbackModal open onClose={close} context={feedbackContext} referenceId={referenceId} />;

  if (step === "success") {
    return (
      <ResultModal open onClose={finish} type="success" message={success.message}>
        {success.actions(finish)}
      </ResultModal>
    );
  }

  if (step === "error") {
    return (
      <ResultModal open onClose={close} type="error" message={failure || t("failed")}>
        {errorActions(close, () => setStep("method"))}
      </ResultModal>
    );
  }

  if (topUp) {
    return (
      <AddBalanceModal
        open
        currencies={[currency]}
        currency={currency}
        onClose={() => (setTopUp(false), void loadBalance())}
        onDone={() => void loadBalance()}
      />
    );
  }

  const totalRow = (
    <div className="flex justify-between border-t border-border pt-2 font-bold">
      <span className="text-orange">{t("total")}</span>
      <span dir="ltr">{money(amount)}</span>
    </div>
  );

  if (step === "summary") {
    return (
      <Modal open onClose={close} showClose title={t("summary")}>
        <div className="flex w-full flex-col gap-2 rounded-lg bg-surface-muted p-4 text-start text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <span className="text-brand">{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
          {totalRow}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" font="button" onClick={close}>
            {t("cancel")}
          </Button>
          <Button variant="solid" font="button" onClick={() => setStep("method")}>
            {t("continue")}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={close}
      showClose
      title={
        <span className="flex flex-col gap-1 text-start">
          {t("methodTitle")}
          <span className="text-sm font-normal text-muted">{t("methodSubtitle")}</span>
        </span>
      }
    >
      <form onSubmit={submit} noValidate className="flex w-full flex-col gap-5 text-start">
        <div role="radiogroup" aria-label={t("methodTitle")} className="grid grid-cols-2 gap-3">
          {(
            [
              ["card", CreditCard],
              ["balance", Wallet],
            ] as const
          ).map(([option, Icon]) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={method === option}
              onClick={() => (setMethod(option), setErrors({}))}
              className={`relative flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold ${
                method === option ? "border-brand bg-brand-soft text-brand" : "border-border"
              }`}
            >
              <Icon className="size-4" />
              {t(`methods.${option}`)}
              {method === option && <CircleCheck className="absolute -end-1.5 -top-1.5 size-4 rounded-full bg-surface text-brand" />}
            </button>
          ))}
        </div>

        {method === "balance" ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <span dir="ltr" className="text-xl font-bold text-link">
              {available === null ? "…" : money(available)}
            </span>
            <span className="text-xs text-link">{t("available")}</span>
            {short && (
              <>
                <p role="alert" className="text-sm text-danger">
                  {t("notEnough")}
                </p>
                <Button variant="orange" font="button" pill onClick={() => setTopUp(true)}>
                  {t("addBalance")}
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <Select
              label={t("savedCards")}
              value={cardId}
              options={[
                ...cards.map((item) => ({ value: String(item.id), label: `${item.brand?.toUpperCase()} •••• ${item.last4}` })),
                { value: "new", label: t("newCard") },
              ]}
              onChange={(event) => setCardId(event.target.value)}
            />
            {!cards.length && <p className="-mt-3 text-xs text-muted">{t("noSavedCards")}</p>}
            {cardId === "new" && (
              <>
                <CardFields card={card} errors={errors} onChange={(next) => (setCard(next), setErrors({}))} />
                <label className="flex items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={saveCard} onChange={(event) => setSaveCard(event.target.checked)} className="size-4 accent-brand" />
                  {t("saveCard")}
                </label>
              </>
            )}
            <PolicyCheckbox checked={agreed} invalid={Boolean(errors.agreed)} onChange={setAgreed}>
              {(link) => t.rich("agree", { link })}
            </PolicyCheckbox>
          </>
        )}

        <div className="flex flex-col gap-2 rounded-lg bg-surface-muted p-3 text-sm">{totalRow}</div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" font="button" onClick={() => setStep("summary")}>
            {t("back")}
          </Button>
          <Button type="submit" variant="solid" font="button" disabled={method === "balance" && (short || available === null)}>
            {t("payNow")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
