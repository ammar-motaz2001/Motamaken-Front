"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Escrow } from "@/lib/api/types";
import { SPLIT_TONE } from "../lib/status";
import { useMoney } from "../lib/useMoney";
import { TextModal } from "./TextModal";

/** Team members approve or object to their share of the escrow; shows who has objected so far. */
export function SplitApproval({ escrow, viewerId, onChanged }: { escrow: Escrow; viewerId: number; onChanged: () => Promise<void> }) {
  const t = useTranslations("Escrow.split");
  const money = useMoney(escrow.currency);
  const [objecting, setObjecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mine = escrow.payees.find((payee) => payee.userId === viewerId);
  const objected = escrow.payees.filter((payee) => payee.splitStatus === "objected");
  const open = escrow.status !== "completed";

  const approve = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/projects/${escrow.projectId}/escrow/split/approve`, { method: "POST" });
      await onChanged();
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-bold">{t("title")}</h3>
        <p className="text-sm text-muted">{escrow.splitApproved ? t("approvedAll") : t("intro")}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-surface-muted text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5 text-start font-medium">{t("member")}</th>
              <th className="px-3 py-2.5 text-start font-medium">{t("share")}</th>
              <th className="px-3 py-2.5 text-start font-medium">{t("amount")}</th>
              <th className="px-3 py-2.5 text-start font-medium">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {escrow.payees.map((payee) => (
              <tr key={payee.userId} className="border-t border-border">
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <UserAvatar name={payee.fullName} src={payee.avatarUrl} size={28} />
                    <span className="font-medium">{payee.fullName}</span>
                    {payee.isLead && <span className="text-xs text-brand">{t("lead")}</span>}
                  </span>
                </td>
                <td className="px-3 py-2.5">{payee.sharePercent}%</td>
                <td dir="ltr" className="px-3 py-2.5 text-start">
                  {money((escrow.totals.total * payee.sharePercent) / 100)}
                </td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={SPLIT_TONE[payee.splitStatus]}>{t(`statuses.${payee.splitStatus}`)}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {objected.length > 0 && (
        <div role="alert" className="flex gap-3 rounded-lg border border-danger/40 bg-danger-soft p-3 text-sm">
          <TriangleAlert className="size-5 shrink-0 text-danger" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="font-bold text-danger">{t("objectedTitle")}</p>
            {objected.map((payee) => (
              <p key={payee.userId}>{t("objectedBy", { name: payee.fullName, note: payee.splitNote ?? "" })}</p>
            ))}
            <p className="text-muted">{t("objectedHelp")}</p>
          </div>
        </div>
      )}

      {mine && open && mine.splitStatus !== "approved" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="solid" font="button" loading={busy} onClick={approve}>
            {t("approve")}
          </Button>
          {mine.splitStatus === "pending" && (
            <Button variant="outlineOrange" font="button" onClick={() => setObjecting(true)}>
              {t("object")}
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      <TextModal
        open={objecting}
        onClose={() => setObjecting(false)}
        title={t("objectTitle")}
        label={t("objectNote")}
        submitLabel={t("object")}
        cancelLabel={t("cancel")}
        required
        minLength={5}
        onSubmit={async (note) => {
          try {
            await api(`/projects/${escrow.projectId}/escrow/split/object`, { method: "POST", body: { note } });
            await onChanged();
            return null;
          } catch (caught) {
            const apiError = caught as ApiError;
            return apiError.fields.note ?? apiError.message ?? t("failed");
          }
        }}
      />
    </section>
  );
}
