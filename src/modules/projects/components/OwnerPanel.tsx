"use client";

import { ReportButton } from "@/modules/reports/components/ReportButton";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { outlinedPanelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Project, Proposal } from "@/lib/api/types";
import { formatAmount, timeAgo } from "@/lib/format";
import { PROPOSAL_STATUS_TONE } from "../lib/status";
import { MessageUserButton } from "./MessageUserButton";

/** Project owner's tools: edit, close, complete or delete the project, and accept one of the received offers. */
export function OwnerPanel({ project, proposals }: { project: Project; proposals: Proposal[] }) {
  const t = useTranslations("Projects.owner");
  const to = useTranslations("Projects.offer");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, path: string, method = "POST", after?: () => void) => {
    if (["delete", "close"].includes(key) && !window.confirm(t(`confirm.${key}`))) return;
    setBusy(key);
    setError(null);
    try {
      await api(path, { method });
      if (after) after();
      else router.refresh();
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`${outlinedPanelClasses} flex flex-wrap items-center gap-2`}>
        <span className="me-auto text-sm text-muted">{t("manage")}</span>
        {project.status === "open" && (
          <>
            <Button variant="outline" pill href={`/projects/${project.id}/edit`}>
              {t("edit")}
            </Button>
            <Button variant="ghost" pill loading={busy === "close"} onClick={() => run("close", `/projects/${project.id}/close`)}>
              {t("close")}
            </Button>
            {proposals.length === 0 && (
              <Button
                variant="ghost"
                pill
                className="text-danger"
                loading={busy === "delete"}
                onClick={() => run("delete", `/projects/${project.id}`, "DELETE", () => router.replace("/my-projects"))}
              >
                {t("delete")}
              </Button>
            )}
          </>
        )}
        {project.status === "in_progress" && (
          <Button variant="solid" pill loading={busy === "complete"} onClick={() => run("complete", `/projects/${project.id}/complete`)}>
            {t("complete")}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className={sectionTitleClasses}>{t("offers", { count: proposals.length })}</h2>
        {proposals.length === 0 && <p className={`${outlinedPanelClasses} text-sm text-muted`}>{t("noOffers")}</p>}
        {proposals.map((proposal) => (
          <article key={proposal.id} className={`${outlinedPanelClasses} flex flex-col gap-3`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              {proposal.freelancer && (
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={proposal.freelancer.fullName}
                    src={proposal.freelancer.avatarUrl}
                    size={44}
                    online={proposal.freelancer.isOnline}
                  />
                  <div>
                    <p className="font-bold">{proposal.freelancer.fullName}</p>
                    <p className="text-xs text-muted">
                      {[proposal.freelancer.jobTitle, proposal.freelancer.rating ? `★ ${proposal.freelancer.rating}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              )}
              <div className="text-end">
                <p className="text-xl font-bold text-brand">{formatAmount(proposal.amount, proposal.currency, locale)}</p>
                <p className="text-xs text-muted">{to("deliveryIn", { count: proposal.deliveryDays })}</p>
              </div>
            </div>
            {proposal.team && (
              <p className="text-sm">
                {to("asTeam", { name: proposal.team.name })}:{" "}
                <span className="text-muted">
                  {proposal.team.members.map((member) => `${member.fullName} (${member.sharePercent}%)`).join(" · ")}
                </span>
              </p>
            )}
            <p className="text-sm whitespace-pre-line">{proposal.message}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={PROPOSAL_STATUS_TONE[proposal.status]}>{to(`status.${proposal.status}`)}</StatusPill>
              <span className="text-xs text-muted">{timeAgo(proposal.createdAt, locale)}</span>
              <ReportButton targetType="proposal" targetId={proposal.id} />
              <span className="ms-auto flex flex-wrap gap-2">
                {proposal.freelancer && <MessageUserButton userId={proposal.freelancer.id} projectId={project.id} />}
                {proposal.status === "pending" && project.status === "open" && (
                  <>
                    <Button
                      variant="ghost"
                      pill
                      className="text-danger"
                      loading={busy === `decline-${proposal.id}`}
                      onClick={() => run(`decline-${proposal.id}`, `/proposals/${proposal.id}/decline`)}
                    >
                      {t("decline")}
                    </Button>
                    <Button
                      variant="solid"
                      pill
                      loading={busy === `accept-${proposal.id}`}
                      onClick={() => run(`accept-${proposal.id}`, `/proposals/${proposal.id}/accept`)}
                    >
                      {t("accept")}
                    </Button>
                  </>
                )}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
