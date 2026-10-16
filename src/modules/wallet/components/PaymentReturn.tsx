"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Deposit } from "@/lib/api/types";
import { PENDING_CARD_KEY, RETURN_MESSAGE, storeCardToken } from "@/lib/moyasar";

type Outcome = { state: "checking" | "succeeded" | "pending" | "failed" | "cardSaved"; message?: string };

/**
 * Back from the bank (3-D Secure). In the payment popup it tells the opening page and closes itself (the payment window
 * there carries on); after a full-page redirect it settles the payment or the card itself and shows the result.
 */
export function PaymentReturn({ depositId, card }: { depositId: number | null; card: boolean }) {
  const t = useTranslations("Wallet.return");
  const locale = useLocale();
  const [outcome, setOutcome] = useState<Outcome>(depositId === null && !card ? { state: "failed" } : { state: "checking" });

  useEffect(() => {
    if (depositId === null && !card) return;
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(card ? { type: RETURN_MESSAGE, card: true } : { type: RETURN_MESSAGE, depositId }, window.location.origin);
      window.close();
      return;
    }

    if (card) {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_CARD_KEY) ?? "null") as { token: string; makeDefault: boolean } | null;
      sessionStorage.removeItem(PENDING_CARD_KEY);
      if (!pending) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to finish: report straight away
        setOutcome({ state: "failed" });
        return;
      }
      storeCardToken(pending.token, pending.makeDefault)
        .then(() => setOutcome({ state: "cardSaved" }))
        .catch((error: ApiError) => setOutcome({ state: "failed", message: error.message }));
      return;
    }

    api<{ data: Deposit }>(`/wallet/deposits/${depositId}/refresh`, { method: "POST" })
      .then(({ data }) => {
        const amount = new Intl.NumberFormat(locale, { style: "currency", currency: data.currency }).format(data.amount);
        setOutcome(
          data.status === "succeeded"
            ? { state: "succeeded", message: t("success", { amount }) }
            : data.status === "pending"
              ? { state: "pending" }
              : { state: "failed", message: data.failureReason ?? undefined },
        );
      })
      .catch(() => setOutcome({ state: "failed" }));
  }, [depositId, card, locale, t]);

  const { state, message } = outcome;
  const titles = { checking: "checking", succeeded: "successTitle", cardSaved: "cardSavedTitle", pending: "pendingTitle", failed: "failedTitle" } as const;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8 text-center">
      {state === "checking" ? (
        <span className="size-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" role="status" />
      ) : (
        <StatusIcon type={state === "succeeded" || state === "cardSaved" ? "success" : "error"} size={56} />
      )}
      <h1 className="text-xl font-bold">{t(titles[state])}</h1>
      {state !== "checking" && (
        <>
          <p className="text-sm text-muted">
            {message || (state === "pending" ? t("pending") : state === "cardSaved" ? t("cardSaved") : state === "failed" ? t("failed") : null)}
          </p>
          <Button variant="solid" font="button" href={state === "cardSaved" ? "/settings/payment" : "/settings/wallet"}>
            {t(state === "cardSaved" ? "toCards" : "toWallet")}
          </Button>
        </>
      )}
    </div>
  );
}
