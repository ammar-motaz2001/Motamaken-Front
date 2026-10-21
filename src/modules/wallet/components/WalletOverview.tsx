"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { usePathname, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { WalletBalance, Withdrawal } from "@/lib/api/types";
import { AddBalanceModal } from "./AddBalanceModal";
import { FeedbackModal, type FeedbackContext } from "./FeedbackModal";
import { MonthlyChart, type MonthlyRow } from "./MonthlyChart";
import { WithdrawModal } from "./WithdrawModal";

type WalletOverviewProps = {
  balances: WalletBalance[];
  currencies: string[];
  currency: string;
  monthly: MonthlyRow[];
  pending: Withdrawal[];
  children: ReactNode;
};

const TILES = [
  { key: "available", tone: "bg-brand text-white" },
  { key: "inEscrow", tone: "bg-nav text-white" },
  { key: "incoming", tone: "bg-orange text-white" },
  { key: "pendingWithdrawals", tone: "bg-link text-white" },
] as const;

/**
 * Wallet screen: balance of the chosen currency, add-balance and withdraw dialogs, pending withdrawals to cancel,
 * the monthly chart and, below, the transactions.
 */
export function WalletOverview({ balances, currencies, currency, monthly, pending, children }: WalletOverviewProps) {
  const t = useTranslations("Wallet");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [modal, setModal] = useState<"add" | "withdraw" | null>(null);
  const [feedback, setFeedback] = useState<{ context: FeedbackContext; id: number } | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<{ context: FeedbackContext; id: number } | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const balance = balances.find((item) => item.currency === currency) ?? { currency, available: 0, inEscrow: 0, incoming: 0, pendingWithdrawals: 0 };
  const money = (value: number, code = currency) => new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(value);

  const closeModal = () => {
    setModal(null);
    if (pendingFeedback) setFeedback(pendingFeedback);
    setPendingFeedback(null);
  };

  const cancel = async (id: number) => {
    setCancelling(id);
    await api(`/wallet/withdrawals/${id}/cancel`, { method: "POST" }).catch(() => undefined);
    setCancelling(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{t("title")}</h2>
            <p className="text-sm text-muted">{t("subtitle")}</p>
          </div>
          {balances.length > 1 && (
            <div role="tablist" aria-label={t("currency")} className="flex gap-1 rounded-lg bg-surface-muted p-1">
              {balances.map((item) => (
                <button
                  key={item.currency}
                  role="tab"
                  aria-selected={item.currency === currency}
                  onClick={() => router.replace(`${pathname}?currency=${item.currency}`)}
                  className={`rounded-md px-3 py-1 text-xs font-bold ${item.currency === currency ? "bg-surface shadow-card" : "text-muted"}`}
                >
                  {item.currency}
                </button>
              ))}
            </div>
          )}
        </div>

        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TILES.map(({ key, tone }) => (
            <li key={key} className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-center">
              <span className={`flex size-20 items-center justify-center rounded-full px-1 text-sm font-bold ${tone}`} dir="ltr">
                {money(balance[key])}
              </span>
              <span className="text-xs text-muted">{t(`balances.${key}`)}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="solid" font="button" onClick={() => setModal("add")}>
            {t("addBalance")}
          </Button>
          <Button variant="outline" font="button" onClick={() => setModal("withdraw")}>
            {t("withdrawBalance")}
          </Button>
        </div>
      </section>

      {pending.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-6">
          <h2 className="text-base font-bold">{t("pending.title")}</h2>
          <ul className="flex flex-col divide-y divide-border">
            {pending.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                <span>
                  <span dir="ltr" className="font-bold">
                    {money(item.amount, item.currency)}
                  </span>{" "}
                  · {t(`withdraw.methods.${item.method}`)} <span dir="ltr">{item.destination}</span>
                </span>
                <span className="flex items-center gap-3">
                  <StatusPill tone="warning">{t("pending.status")}</StatusPill>
                  <button
                    type="button"
                    disabled={cancelling === item.id}
                    onClick={() => cancel(item.id)}
                    className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                  >
                    {t("pending.cancel")}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <MonthlyChart rows={monthly} currency={currency} />
      </section>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">{children}</div>

      <AddBalanceModal
        open={modal === "add"}
        onClose={closeModal}
        currencies={currencies}
        currency={currency}
        onDone={(deposit) => (setPendingFeedback({ context: "deposit", id: deposit.id }), router.refresh())}
      />
      <WithdrawModal
        open={modal === "withdraw"}
        onClose={closeModal}
        balances={balances.length ? balances : [balance]}
        currency={currency}
        onDone={(withdrawal) => (setPendingFeedback({ context: "withdrawal", id: withdrawal.id }), router.refresh())}
      />
      <FeedbackModal open={Boolean(feedback)} onClose={() => setFeedback(null)} context={feedback?.context ?? "deposit"} referenceId={feedback?.id} />
    </div>
  );
}
