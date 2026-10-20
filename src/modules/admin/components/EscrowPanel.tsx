import { getLocale, getTranslations } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { dateTime, money, toneFor } from "../lib";
import type { AdminEscrow } from "../types";
import { ActionButton } from "./ActionButton";
import { AdminTable, Cell, StatCard } from "./AdminUi";
import { UserCell } from "./UserCell";

/** A contract at a glance: who pays whom, the money held and released, and every milestone with its notes. */
export async function EscrowPanel({ escrow, canCancel }: { escrow: AdminEscrow; canCancel: boolean }) {
  const [t, locale] = await Promise.all([getTranslations("Admin.escrows"), getLocale()]);
  const amount = (value: number) => money(value, escrow.currency, locale);
  const finished = ["completed", "cancelled"].includes(escrow.status);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusPill tone={toneFor(escrow.status)}>{t(`statuses.${escrow.status}`)}</StatusPill>
          <span className="text-muted">{t("client")}:</span>
          <UserCell user={escrow.client} />
        </div>
        {canCancel && !finished && (
          <ActionButton
            label={t("cancel")}
            tone="danger"
            endpoint={`/admin/escrows/${escrow.id}/cancel`}
            description={t("cancelHint")}
            fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true }]}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("total")} value={amount(escrow.total)} />
        <StatCard label={t("held")} value={amount(escrow.held)} tone={escrow.held ? "orange" : "default"} />
        <StatCard label={t("released")} value={amount(escrow.released)} tone="brand" />
        <StatCard label={t("refunded")} value={amount(escrow.refunded)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {escrow.payees.map((payee) => (
          <span key={payee.user?.id} className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
            {payee.user?.fullName} · {payee.sharePercent}%{payee.isLead ? ` · ${t("lead")}` : ""}
            {payee.splitStatus !== "approved" && <StatusPill tone={payee.splitStatus === "objected" ? "danger" : "warning"}>{t(`split.${payee.splitStatus}`)}</StatusPill>}
            {payee.splitNote && <span className="text-muted">“{payee.splitNote}”</span>}
          </span>
        ))}
      </div>
      {escrow.milestones && (
        <AdminTable head={[t("milestone"), t("amount"), t("state"), t("notes"), t("dates")]}>
          {escrow.milestones.map((m) => (
            <tr key={m.id}>
              <Cell className="font-medium">
                {m.position}. {m.title}
                {m.dueDate && <div className="text-xs text-muted">{t("due", { date: m.dueDate })}</div>}
              </Cell>
              <Cell className="whitespace-nowrap">
                {amount(m.amount)}
                {m.fee > 0 && <div className="text-xs text-muted">{t("fee", { fee: amount(m.fee) })}</div>}
                {m.refunded > 0 && <div className="text-xs text-danger">{t("refundedPart", { amount: amount(m.refunded) })}</div>}
              </Cell>
              <Cell>
                <StatusPill tone={toneFor(m.status)}>{t(`milestoneStatus.${m.status}`)}</StatusPill>
              </Cell>
              <Cell className="max-w-xs text-xs">
                {m.submissionNote && <p>{t("delivered")}: {m.submissionNote}</p>}
                {m.changesNote && <p className="text-orange">{t("changesAsked")}: {m.changesNote}</p>}
              </Cell>
              <Cell className="text-xs whitespace-nowrap text-muted">
                {m.fundedAt && <div>{t("fundedAt", { date: dateTime(m.fundedAt, locale) })}</div>}
                {m.submittedAt && <div>{t("submittedAt", { date: dateTime(m.submittedAt, locale) })}</div>}
                {m.releasedAt && <div>{t("releasedAt", { date: dateTime(m.releasedAt, locale) })}</div>}
              </Cell>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
