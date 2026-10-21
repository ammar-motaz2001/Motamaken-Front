"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { WalletBalance, Withdrawal } from "@/lib/api/types";
import { ProcessingScreen } from "./ProcessingScreen";

type Step = "form" | "processing" | "success" | "error";
type Form = { amount: string; currency: string; method: "bank_transfer" | "paypal"; accountName: string; iban: string; email: string };

type WithdrawModalProps = { open: boolean; onClose: () => void; onDone: (withdrawal: Withdrawal) => void; balances: WalletBalance[]; currency: string };

/** Withdraw request: amount up to the available balance, bank transfer (IBAN) or PayPal, sent to POST /wallet/withdrawals. */
export function WithdrawModal({ open, onClose, onDone, balances, currency }: WithdrawModalProps) {
  const t = useTranslations("Wallet.withdraw");
  const initial: Form = { amount: "", currency, method: "bank_transfer", accountName: "", iban: "", email: "" };
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>("form");
  const [failure, setFailure] = useState<{ message: string; code?: string }>({ message: "" });
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const available = balances.find((item) => item.currency === form.currency)?.available ?? 0;

  const set = (key: keyof Form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors({});
  };

  const close = () => {
    setForm(initial);
    setErrors({});
    setStep("form");
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!(Number(form.amount) > 0)) found.amount = t("errors.amount");
    else if (Number(form.amount) > available) found.amount = t("errors.tooMuch");
    if (form.method === "bank_transfer") {
      if (form.accountName.trim().length < 2) found.accountName = t("errors.accountName");
      if (!/^[A-Za-z0-9 ]{15,34}$/.test(form.iban.trim())) found.iban = t("errors.iban");
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      found.email = t("errors.email");
    }
    setErrors(found);
    if (Object.keys(found).length) return;

    setStep("processing");
    try {
      const destination = form.method === "bank_transfer" ? { accountName: form.accountName.trim(), iban: form.iban.trim() } : { email: form.email.trim() };
      const { data } = await api<{ data: Withdrawal }>("/wallet/withdrawals", {
        method: "POST",
        body: { amount: Number(form.amount), currency: form.currency, method: form.method, destination },
      });
      setWithdrawal(data);
      setStep("success");
      onDone(data);
    } catch (caught) {
      const apiError = caught as ApiError;
      const fields = apiError.fields;
      if (Object.keys(fields).length) {
        setErrors({
          ...(fields.amount && { amount: fields.amount }),
          ...(fields["destination.accountName"] && { accountName: fields["destination.accountName"] }),
          ...(fields["destination.iban"] && { iban: fields["destination.iban"] }),
          ...(fields["destination.email"] && { email: fields["destination.email"] }),
        });
        setStep("form");
        return;
      }
      setFailure({ message: apiError.message ?? "", code: apiError.code });
      setStep("error");
    }
  };

  if (!open) return null;
  if (step === "processing") return <ProcessingScreen />;

  if (step === "success" && withdrawal) {
    return (
      <ResultModal
        open
        onClose={close}
        type="success"
        title={t("title")}
        message={t("success", { amount: withdrawal.amount, fee: withdrawal.fee, currency: withdrawal.currency })}
      >
        <Button variant="solid" font="button" onClick={close}>
          {t("backToWallet")}
        </Button>
      </ResultModal>
    );
  }

  if (step === "error") {
    return (
      <ResultModal open onClose={close} type="error" title={t("title")} message={failure.message || t("failed")}>
        {failure.code === "kyc_required" ? (
          <Button variant="orange" font="button" href="/settings/verification">
            {t("verifyNow")}
          </Button>
        ) : (
          <Button variant="orange" font="button" onClick={() => setStep("form")}>
            {t("tryAgain")}
          </Button>
        )}
        <Button variant="outlineOrange" font="button" onClick={close}>
          {t("backToWallet")}
        </Button>
      </ResultModal>
    );
  }

  return (
    <Modal
      open
      onClose={close}
      showClose
      title={
        <span className="flex flex-col gap-1 text-start">
          {t("title")}
          <span className="text-sm font-normal text-muted">{t("subtitle")}</span>
        </span>
      }
    >
      <form onSubmit={submit} noValidate className="flex w-full flex-col gap-5 text-start">
        <div className="flex items-center justify-between rounded-lg bg-brand-soft p-3 text-sm">
          <span>{t("available")}</span>
          <span dir="ltr" className="font-bold text-brand">
            {available.toFixed(2)} {form.currency}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field
            label={t("amount")}
            required
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            dir="ltr"
            value={form.amount}
            error={errors.amount}
            hint={t("feeNote")}
            onChange={(event) => set("amount", event.target.value)}
          />
          <Select
            label={t("currency")}
            value={form.currency}
            options={balances.map((item) => ({ value: item.currency, label: item.currency }))}
            onChange={(event) => set("currency", event.target.value)}
          />
        </div>

        <div role="radiogroup" aria-label={t("method")} className="grid grid-cols-2 gap-3">
          {(["bank_transfer", "paypal"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={form.method === option}
              onClick={() => set("method", option)}
              className={`rounded-lg border px-3 py-3 text-sm font-bold ${form.method === option ? "border-brand bg-brand-soft text-brand" : "border-border"}`}
            >
              {t(`methods.${option}`)}
            </button>
          ))}
        </div>

        {form.method === "bank_transfer" ? (
          <>
            <Field label={t("accountName")} required value={form.accountName} error={errors.accountName} onChange={(event) => set("accountName", event.target.value)} />
            <Field label={t("iban")} required dir="ltr" placeholder="SA00 0000 0000 0000 0000 0000" value={form.iban} error={errors.iban} onChange={(event) => set("iban", event.target.value.toUpperCase())} />
          </>
        ) : (
          <Field label={t("paypalEmail")} required type="email" dir="ltr" value={form.email} error={errors.email} onChange={(event) => set("email", event.target.value)} />
        )}

        <div className="flex justify-center gap-3">
          <Button variant="outline" font="button" onClick={close}>
            {t("cancel")}
          </Button>
          <Button type="submit" variant="solid" font="button">
            {t("submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
