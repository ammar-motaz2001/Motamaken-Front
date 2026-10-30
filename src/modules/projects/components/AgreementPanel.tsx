"use client";

import { confirmDialog } from "@/components/ui/ConfirmDialog";
import { FileClock, Handshake } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StatusPill } from "@/components/ui/StatusPill";
import { panelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { TextArea } from "@/components/ui/TextArea";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { AgreementChange } from "@/lib/api/types";
import { formatAmount, timeAgo } from "@/lib/format";

type AgreementPanelProps = {
  projectId: number;
  /** The project is in progress: new requests can be made. */
  open: boolean;
  offer: { amount: number; currency: string; deliveryDays: number } | null;
  changes: AgreementChange[];
};

const MIN_REASON = 10;
const TONE = { pending: "warning", accepted: "success", declined: "danger", withdrawn: "muted" } as const;

/**
 * The agreement between client and freelancer after an offer is accepted: either side asks to change the price or
 * delivery time, or to cancel (refunding what is in escrow); the other side accepts or declines; the asker can withdraw.
 */
export function AgreementPanel({ projectId, open, offer, changes }: AgreementPanelProps) {
  const t = useTranslations("Agreement");
  const locale = useLocale();
  const router = useRouter();
  const [form, setForm] = useState<"change" | "cancel" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = changes.find((change) => change.status === "pending");
  const history = changes.filter((change) => change !== pending);
  const money = (amount: number) => formatAmount(amount, offer?.currency ?? "USD", locale);

  const run = async (key: string, path: string, body?: Record<string, unknown>) => {
    setBusy(key);
    setError(null);
    try {
      await api(path, { method: "POST", body });
      router.refresh();
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(null);
    }
  };

  const describe = (change: AgreementChange) =>
    change.type === "cancel"
      ? t("cancelSummary")
      : [change.amount !== null && t("newPrice", { amount: money(change.amount) }), change.deliveryDays !== null && t("newDays", { count: change.deliveryDays })]
          .filter(Boolean)
          .join(" · ");

  if (!open && changes.length === 0) return null;

  return (
    <section className={`${panelClasses} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Handshake className="size-5 text-brand" aria-hidden />
          <h2 className={sectionTitleClasses}>{t("title")}</h2>
        </div>
        {offer && (
          <p className="text-sm text-muted">
            {t("current", { amount: money(offer.amount), count: offer.deliveryDays })}
          </p>
        )}
      </div>

      {pending ? (
        <div className="flex flex-col gap-3 rounded-lg border border-orange/40 bg-orange/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="warning">{t(`types.${pending.type}`)}</StatusPill>
            <span className="text-sm font-semibold">{describe(pending)}</span>
          </div>
          <p className="text-sm whitespace-pre-line" dir="auto">
            {pending.reason}
          </p>
          <p className="text-xs text-muted" suppressHydrationWarning>
            {pending.mine ? t("youAsked", { time: timeAgo(pending.createdAt, locale) }) : t("theyAsked", { name: pending.requester.fullName, time: timeAgo(pending.createdAt, locale) })}
          </p>
          {pending.type === "cancel" && !pending.mine && <p className="rounded-md bg-surface p-3 text-xs text-muted">{t("cancelEffect")}</p>}
          <div className="flex flex-wrap gap-2">
            {pending.mine ? (
              <Button variant="ghost" size="sm" pill loading={busy === "withdraw"} onClick={() => run("withdraw", `/agreement-changes/${pending.id}/withdraw`)}>
                {t("withdraw")}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  pill
                  loading={busy === "accept"}
                  onClick={async () => (await confirmDialog(t(`acceptConfirm.${pending.type}`))) && run("accept", `/agreement-changes/${pending.id}/accept`)}
                >
                  {t("accept")}
                </Button>
                <Button variant="outlineOrange" size="sm" pill loading={busy === "decline"} onClick={() => run("decline", `/agreement-changes/${pending.id}/decline`)}>
                  {t("decline")}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        open && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">{t("intro")}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" pill onClick={() => setForm("change")}>
                {t("requestChange")}
              </Button>
              <Button variant="outlineOrange" size="sm" pill onClick={() => setForm("cancel")}>
                {t("requestCancel")}
              </Button>
            </div>
          </div>
        )
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {history.length > 0 && (
        <details className="text-sm">
          <summary className="flex cursor-pointer items-center gap-1.5 text-muted">
            <FileClock className="size-4" aria-hidden /> {t("history", { count: history.length })}
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {history.map((change) => (
              <li key={change.id} className="flex flex-wrap items-center gap-2 border-b border-border pb-2 last:border-0">
                <StatusPill tone={TONE[change.status]}>{t(`statuses.${change.status}`)}</StatusPill>
                <span className="font-medium">{t(`types.${change.type}`)}</span>
                <span className="text-muted">{describe(change)}</span>
                <span className="ms-auto text-xs text-muted" suppressHydrationWarning>
                  {change.requester.fullName} · {timeAgo(change.createdAt, locale)}
                </span>
                {change.responseNote && (
                  <p className="w-full text-xs text-muted" dir="auto">
                    {t("note", { note: change.responseNote })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {form && offer && (
        <RequestModal
          type={form}
          offer={offer}
          onClose={() => setForm(null)}
          onSent={() => {
            setForm(null);
            router.refresh();
          }}
          projectId={projectId}
        />
      )}
    </section>
  );
}

/** Form for a new request: the new price and/or delivery time (change) or just the reason (cancel). */
function RequestModal({
  type,
  offer,
  projectId,
  onClose,
  onSent,
}: {
  type: "change" | "cancel";
  offer: { amount: number; currency: string; deliveryDays: number };
  projectId: number;
  onClose: () => void;
  onSent: () => void;
}) {
  const t = useTranslations("Agreement");
  const [amount, setAmount] = useState(String(offer.amount));
  const [days, setDays] = useState(String(offer.deliveryDays));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (reason.trim().length < MIN_REASON) return setFields({ reason: t("reasonTooShort", { min: MIN_REASON }) });
    setBusy(true);
    setError(null);
    try {
      const changed =
        type === "change"
          ? {
              ...(Number(amount) !== offer.amount && { amount: Number(amount) }),
              ...(Number(days) !== offer.deliveryDays && { deliveryDays: Number(days) }),
            }
          : {};
      await api(`/projects/${projectId}/agreement-changes`, { method: "POST", body: { type, reason: reason.trim(), ...changed } });
      onSent();
    } catch (caught) {
      const apiError = caught as ApiError;
      setFields(Object.fromEntries(Object.entries(apiError.fields).map(([key, value]) => [key, String(value)])));
      setError(apiError.message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t(type === "change" ? "requestChange" : "requestCancel")} showClose>
      <form onSubmit={submit} noValidate className="flex w-full flex-col gap-4 text-start">
        <p className="text-sm text-muted">{t(type === "change" ? "changeHint" : "cancelHint")}</p>
        {type === "change" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={t("price", { currency: offer.currency })}
              type="number"
              min={1}
              step="0.01"
              inputMode="decimal"
              value={amount}
              error={fields.amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Field
              label={t("days")}
              type="number"
              min={1}
              inputMode="numeric"
              value={days}
              error={fields.deliveryDays}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
        )}
        <TextArea
          label={t("reason")}
          required
          rows={4}
          maxLength={1000}
          value={reason}
          error={fields.reason}
          hint={t("reasonHint", { count: reason.trim().length, min: MIN_REASON })}
          hintTone={reason.trim().length < MIN_REASON ? "danger" : "success"}
          onChange={(event) => {
            setReason(event.target.value);
            setFields((current) => ({ ...current, reason: "" }));
          }}
        />
        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("close")}
          </Button>
          <Button type="submit" variant={type === "cancel" ? "orange" : "primary"} size="sm" loading={busy}>
            {t("send")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
