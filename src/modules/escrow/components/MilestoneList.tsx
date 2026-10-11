"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ResultModal } from "@/components/ui/ResultModal";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Escrow, Milestone } from "@/lib/api/types";
import { PayModal } from "@/modules/payments";
import { MILESTONE_TONE } from "../lib/status";
import { useMoney } from "../lib/useMoney";
import { DisputeModal } from "./DisputeModal";
import { TextModal } from "./TextModal";

export type EscrowRole = "client" | "lead" | "member";

type MilestoneListProps = { escrow: Escrow; role: EscrowRole; onChanged: () => Promise<void> };

export function MilestoneList({ escrow, role, onChanged }: MilestoneListProps) {
  const t = useTranslations("Escrow");
  const format = useFormatter();
  const money = useMoney(escrow.currency);
  const [funding, setFunding] = useState<Milestone[] | null>(null);
  const [approving, setApproving] = useState<Milestone | null>(null);
  const [delivering, setDelivering] = useState<Milestone | null>(null);
  const [changing, setChanging] = useState<Milestone | null>(null);
  const [disputing, setDisputing] = useState<Milestone | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = escrow.milestones.filter((item) => item.status === "pending");
  const canDispute = role !== "member";

  const action = async (path: string, body?: Record<string, unknown>) => {
    try {
      await api(path, { method: "POST", body });
      await onChanged();
      return null;
    } catch (caught) {
      return (caught as ApiError).message || t("failed");
    }
  };

  const approve = async () => {
    if (!approving) return;
    setBusy(true);
    const failure = await action(`/milestones/${approving.id}/approve`);
    setBusy(false);
    setApproving(null);
    setError(failure);
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold">{t("milestones.title")}</h3>
        {role === "client" && pending.length > 1 && (
          <Button variant="solid" font="button" onClick={() => setFunding(pending)}>
            {t("milestones.fundAll", { amount: money(pending.reduce((sum, item) => sum + item.amount, 0)) })}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface-muted text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5 text-start font-medium">{t("milestones.name")}</th>
              <th className="px-3 py-2.5 text-start font-medium">{t("milestones.amount")}</th>
              <th className="px-3 py-2.5 text-start font-medium">{t("milestones.share")}</th>
              <th className="px-3 py-2.5 text-start font-medium">{t("milestones.due")}</th>
              <th className="px-3 py-2.5 text-start font-medium">{t("milestones.status")}</th>
              <th className="px-3 py-2.5 text-end font-medium">{t("milestones.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {escrow.milestones.map((item) => (
              <tr key={item.id} className="border-t border-border align-top">
                <td className="px-3 py-3">
                  <p className="font-medium">
                    {item.position}. {item.title}
                  </p>
                  {item.submissionNote && <p className="mt-1 text-xs text-muted">{t("milestones.delivered", { note: item.submissionNote })}</p>}
                  {item.changesNote && item.status === "funded" && <p className="mt-1 text-xs text-orange">{t("milestones.changes", { note: item.changesNote })}</p>}
                </td>
                <td dir="ltr" className="px-3 py-3 text-start font-bold whitespace-nowrap">
                  {money(item.amount)}
                </td>
                <td className="px-3 py-3 text-muted">{Math.round((item.amount / escrow.totals.total) * 100)}%</td>
                <td className="px-3 py-3 whitespace-nowrap text-muted">{item.dueDate ? format.dateTime(new Date(item.dueDate), { dateStyle: "medium" }) : "—"}</td>
                <td className="px-3 py-3">
                  <StatusPill tone={MILESTONE_TONE[item.status]}>{t(`milestones.statuses.${item.status}`)}</StatusPill>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {role === "client" && item.status === "pending" && (
                      <button type="button" className="text-xs font-bold text-brand hover:underline" onClick={() => setFunding([item])}>
                        {t("milestones.fund")}
                      </button>
                    )}
                    {role === "client" && ["funded", "submitted"].includes(item.status) && (
                      <button type="button" className="text-xs font-bold text-brand hover:underline" onClick={() => setApproving(item)}>
                        {t("milestones.approve")}
                      </button>
                    )}
                    {role === "client" && item.status === "submitted" && (
                      <button type="button" className="text-xs font-bold text-orange hover:underline" onClick={() => setChanging(item)}>
                        {t("milestones.requestChanges")}
                      </button>
                    )}
                    {role === "lead" && item.status === "funded" && (
                      <button type="button" className="text-xs font-bold text-brand hover:underline" onClick={() => setDelivering(item)}>
                        {t("milestones.deliver")}
                      </button>
                    )}
                    {canDispute && ["funded", "submitted"].includes(item.status) && (
                      <button type="button" className="text-xs font-bold text-danger hover:underline" onClick={() => setDisputing(item)}>
                        {t("milestones.dispute")}
                      </button>
                    )}
                    {item.status === "disputed" && (
                      <Link href="/disputes" className="text-xs font-bold text-danger hover:underline">
                        {t("milestones.viewDispute")}
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {funding && (
        <PayModal
          open
          onClose={() => (setFunding(null), void onChanged())}
          amount={funding.reduce((sum, item) => sum + item.amount, 0)}
          currency={escrow.currency}
          feedbackContext="escrow"
          rows={funding.map((item) => ({ label: item.title, value: <span dir="ltr">{money(item.amount)}</span> }))}
          pay={async () => {
            if (funding.length > 1) await api(`/projects/${escrow.projectId}/escrow/fund`, { method: "POST" });
            else await api(`/milestones/${funding[0].id}/fund`, { method: "POST" });
            return escrow.id;
          }}
          success={{
            message: t("milestones.funded"),
            actions: (done) => (
              <Button variant="solid" font="button" onClick={done}>
                {t("close")}
              </Button>
            ),
          }}
          errorActions={(dismiss, retry) => (
            <>
              <Button variant="outlineOrange" font="button" onClick={dismiss}>
                {t("close")}
              </Button>
              <Button variant="orange" font="button" onClick={retry}>
                {t("tryAgain")}
              </Button>
            </>
          )}
        />
      )}

      <ResultModal
        open={Boolean(approving)}
        onClose={() => setApproving(null)}
        type="warning"
        message={t("milestones.approveConfirm", { milestone: approving?.title ?? "", amount: money(approving?.amount ?? 0) })}
      >
        <Button variant="outline" font="button" onClick={() => setApproving(null)}>
          {t("cancel")}
        </Button>
        <Button variant="solid" font="button" loading={busy} onClick={approve}>
          {t("milestones.approve")}
        </Button>
      </ResultModal>

      <TextModal
        open={Boolean(delivering)}
        onClose={() => setDelivering(null)}
        title={t("milestones.deliverTitle", { milestone: delivering?.title ?? "" })}
        label={t("milestones.deliverNote")}
        submitLabel={t("milestones.deliver")}
        cancelLabel={t("cancel")}
        onSubmit={(note) => action(`/milestones/${delivering?.id}/submit`, { note: note || null })}
      />
      <TextModal
        open={Boolean(changing)}
        onClose={() => setChanging(null)}
        title={t("milestones.changesTitle", { milestone: changing?.title ?? "" })}
        label={t("milestones.changesNote")}
        submitLabel={t("milestones.requestChanges")}
        cancelLabel={t("cancel")}
        required
        minLength={5}
        onSubmit={(note) => action(`/milestones/${changing?.id}/request-changes`, { note })}
      />
      <DisputeModal milestone={disputing} onClose={() => setDisputing(null)} />
    </section>
  );
}
