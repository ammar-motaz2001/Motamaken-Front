"use client";

import { CircleCheck, CreditCard, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ResultModal } from "@/components/ui/ResultModal";
import { Select } from "@/components/ui/Select";
import { softSuccessClasses } from "@/components/ui/styles";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Currency, PaymentMethod } from "@/lib/api/types";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import { SavedMethod } from "./SavedMethod";
import { SettingsPanel } from "./SettingsPanel";

type PaymentSettingsProps = { methods: PaymentMethod[]; currencies: Currency[]; currency: string };

export function PaymentSettings({ methods: initial, currencies, currency: initialCurrency }: PaymentSettingsProps) {
  const t = useTranslations("Settings.payment");
  const router = useRouter();
  const [methods, setMethods] = useState(initial);
  const [preferred, setPreferred] = useState(String(initial.find((method) => method.isDefault)?.id ?? ""));
  const [currency, setCurrency] = useState(initialCurrency);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PaymentMethod | null>(null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = (method: PaymentMethod) =>
    method.type === "card" ? t("methodLabel.card", { brand: method.brand ?? "", last4: method.last4 ?? "" }) : t("methodLabel.paypal", { email: method.email ?? "" });

  const reload = async () => {
    const { data } = await api<{ data: PaymentMethod[] }>("/me/payment-methods");
    setMethods(data);
    setPreferred(String(data.find((method) => method.isDefault)?.id ?? ""));
  };

  const remove = async () => {
    if (!removing) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/me/payment-methods/${removing.id}`, { method: "DELETE" });
      await reload();
      setRemoving(null);
      setRemoved(true);
    } catch (caught) {
      setRemoving(null);
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const current = methods.find((method) => method.isDefault);
      if (preferred && String(current?.id) !== preferred) {
        await api(`/me/payment-methods/${preferred}/default`, { method: "POST" });
        await reload();
      }
      if (currency !== initialCurrency) {
        await api("/me/preferences", { method: "PATCH", body: { currency } });
        router.refresh();
      }
      setSaved(true);
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold">{t("saved")}</h3>
          {methods.length ? (
            <div className="flex flex-col gap-4">
              {methods.map((method) => (
                <SavedMethod key={method.id} method={method} onRemove={() => setRemoving(method)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted">
              <CreditCard className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
              <p className="max-w-sm">{t("empty")}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center justify-center gap-2 self-center rounded-md border border-brand px-6 py-2 text-sm font-medium text-brand hover:bg-brand-soft"
          >
            <Plus className="size-4" />
            {t("addNew")}
          </button>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-5">
          <h3 className="text-sm font-bold">{t("paymentMethod")}</h3>
          <Select
            label={t("preferredLabel")}
            value={preferred}
            placeholder={t("preferredPlaceholder")}
            disabled={!methods.length}
            options={methods.map((method) => ({ value: String(method.id), label: label(method) }))}
            onChange={(event) => (setPreferred(event.target.value), setSaved(false))}
          />
          <Select
            label={t("currency")}
            value={currency}
            options={currencies.map((item) => ({ value: item.code, label: `${item.code} — ${item.name}` }))}
            onChange={(event) => (setCurrency(event.target.value), setSaved(false))}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className={`${softSuccessClasses} flex items-center gap-2 p-3 text-sm text-brand`}>
            <CircleCheck className="size-4" />
            {t("savedChanges")}
          </p>
        )}
      </SettingsPanel>

      <div className="flex justify-center">
        <Button variant="solid" font="button" loading={busy && !removing} onClick={save}>
          {t("save")}
        </Button>
      </div>

      <AddPaymentMethodModal open={adding} onClose={() => setAdding(false)} onSaved={() => void reload()} />

      <ResultModal open={Boolean(removing)} onClose={() => setRemoving(null)} type="warning" message={t("remove.confirm")}>
        <Button variant="outlineOrange" font="button" onClick={() => setRemoving(null)}>
          {t("remove.keep")}
        </Button>
        <Button variant="orange" font="button" loading={busy} onClick={remove}>
          {t("remove.button")}
        </Button>
      </ResultModal>

      <ResultModal open={removed} onClose={() => setRemoved(false)} type="success" message={t("remove.done")}>
        <Button variant="primary" font="button" width={260} onClick={() => setRemoved(false)}>
          {t("close")}
        </Button>
      </ResultModal>
    </div>
  );
}
