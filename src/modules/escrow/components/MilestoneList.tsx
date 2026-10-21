"use client";

import { ExternalLink, Plus, X } from "lucide-react";
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

type MilestoneListProps = {
  escrow: Escrow;
  role: EscrowRole;
  onChanged: () => Promise<void>;
  /** Influencer requests: a delivery must carry links to the published posts. */
  proofRequired?: boolean;
};

const MAX_LINKS = 5;

/**
 * Milestones with the actions the viewer's role allows: the client funds and approves or asks for changes,
 * the freelancer delivers, and both sides (not team members) can dispute.
 */
export function MilestoneList({ escrow, role, onChanged, proofRequired = false }: MilestoneListProps) {
  const t = useTranslations("Escrow");
  const format = useFormatter();
  const money = useMoney(escrow.currency);
  const [funding, setFunding] = useState<Milestone[] | null>(null);
  const [approving, setApproving] = useState<Milestone | null>(null);
  const [delivering, setDelivering] = useState<Milestone | null>(null);
  const [links, setLinks] = useState<string[]>([""]);
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
                  {item.deliveryLinks.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {item.deliveryLinks.map((link) => (
                        <li key={link}>
                          <a href={link} target="_blank" rel="noreferrer nofollow" dir="ltr" className="inline-flex max-w-[260px] items-center gap-1 truncate text-xs text-link hover:underline">
                            <ExternalLink className="size-3 shrink-0" aria-hidden />
                            <span className="truncate">{link.replace(/^https:\/\/(www\.)?/, "")}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
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
        onClose={() => {
          setDelivering(null);
          setLinks([""]);
        }}
        title={t("milestones.deliverTitle", { milestone: delivering?.title ?? "" })}
        label={t("milestones.deliverNote")}
        submitLabel={t("milestones.deliver")}
        cancelLabel={t("cancel")}
        onSubmit={(note) => {
          const filled = links.map((link) => link.trim()).filter(Boolean);
          if (proofRequired && filled.length === 0) return Promise.resolve(t("milestones.proofRequired"));
          if (filled.some((link) => !/^https:\/\/\S+\.\S+/.test(link))) return Promise.resolve(t("milestones.linkInvalid"));
          return action(`/milestones/${delivering?.id}/submit`, { note: note || null, links: filled }).then((failure) => {
            if (!failure) setLinks([""]);
            return failure;
          });
        }}
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            {t(proofRequired ? "milestones.proofLinks" : "milestones.deliveryLinks")}
            {proofRequired && <span className="text-danger"> *</span>}
          </p>
          <p className="text-xs text-muted">{t(proofRequired ? "milestones.proofHint" : "milestones.linksHint")}</p>
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                dir="ltr"
                inputMode="url"
                placeholder="https://"
                aria-label={t("milestones.linkLabel", { number: index + 1 })}
                value={link}
                onChange={(event) => setLinks((current) => current.map((value, position) => (position === index ? event.target.value : value)))}
                className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none"
              />
              {links.length > 1 && (
                <button
                  type="button"
                  aria-label={t("milestones.removeLink")}
                  onClick={() => setLinks((current) => current.filter((_, position) => position !== index))}
                  className="flex size-10 items-center justify-center rounded-md border border-border text-danger"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          {links.length < MAX_LINKS && (
            <button type="button" onClick={() => setLinks((current) => [...current, ""])} className="flex items-center gap-1 self-start text-sm font-medium text-brand">
              <Plus className="size-4" /> {t("milestones.addLink")}
            </button>
          )}
        </div>
      </TextModal>
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
