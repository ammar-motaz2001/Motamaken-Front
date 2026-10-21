"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { panelClasses } from "@/components/ui/styles";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Escrow } from "@/lib/api/types";
import { EscrowSummary } from "./EscrowSummary";
import { MilestoneList, type EscrowRole } from "./MilestoneList";
import { SetupEscrowForm } from "./SetupEscrowForm";
import { SplitApproval } from "./SplitApproval";
import { TipBox } from "./TipBox";

type EscrowPanelProps = {
  projectId: number;
  escrow: Escrow | null;
  viewerId: number;
  isClient: boolean;
  offer: { amount: number; currency: string } | null;
  /** Influencer requests: deliveries must carry links to the published posts. */
  proofRequired?: boolean;
};

const STATUS_TONE = { awaiting_funding: "warning", active: "success", completed: "muted" } as const;

/**
 * Escrow box on a hired project: setup for the client, summary, team split approval, milestones and tip;
 * re-reads GET /projects/{id}/escrow after every change.
 */
export function EscrowPanel({ projectId, escrow: initial, viewerId, isClient, offer, proofRequired }: EscrowPanelProps) {
  const t = useTranslations("Escrow");
  const router = useRouter();
  const [escrow, setEscrow] = useState(initial);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const result = await api<{ data: Escrow }>(`/projects/${projectId}/escrow`).catch(() => null);
    setEscrow(result?.data ?? null);
    router.refresh();
  };

  const payee = escrow?.payees.find((item) => item.userId === viewerId);
  const role: EscrowRole = isClient ? "client" : payee?.isLead ? "lead" : "member";

  const cancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await api(`/projects/${projectId}/escrow/cancel`, { method: "POST" });
      setEscrow(null);
      router.refresh();
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className={`${panelClasses} flex flex-col gap-6`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-8 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          <div>
            <h2 className="text-lg font-bold">{t("title")}</h2>
            <p className="text-sm text-muted">{t("subtitle")}</p>
          </div>
        </div>
        {escrow && <StatusPill tone={STATUS_TONE[escrow.status]}>{t(`statuses.${escrow.status}`)}</StatusPill>}
      </header>

      {!escrow ? (
        isClient && offer ? (
          <SetupEscrowForm projectId={projectId} total={offer.amount} currency={offer.currency} onCreated={(created) => (setEscrow(created), router.refresh())} />
        ) : (
          <p className="rounded-lg bg-surface-muted p-4 text-sm text-muted">{t("waitingForClient")}</p>
        )
      ) : (
        <>
          <EscrowSummary escrow={escrow} />
          {escrow.payees.length > 1 && <SplitApproval escrow={escrow} viewerId={viewerId} onChanged={reload} />}
          {!escrow.splitApproved && isClient && <p className="rounded-lg bg-orange/10 p-3 text-sm text-orange">{t("split.blocked")}</p>}
          <MilestoneList escrow={escrow} role={role} onChanged={reload} proofRequired={proofRequired} />
          {escrow.milestones.some((item) => item.status === "released") && (
            <TipBox escrow={escrow} canTip={isClient} onChanged={reload} />
          )}
          {isClient && escrow.milestones.every((item) => item.status === "pending") && (
            <Button variant="outlineOrange" font="button" loading={cancelling} onClick={cancel} className="self-start">
              {t("cancelEscrow")}
            </Button>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
        </>
      )}
    </section>
  );
}
