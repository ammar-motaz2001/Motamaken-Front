"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { outlinedPanelClasses, softSuccessClasses } from "@/components/ui/styles";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { TeamInvitation } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { MEMBER_STATUS_TONE } from "../lib/status";
import { useAction } from "../lib/useAction";

export function InvitationCard({ invitation }: { invitation: TeamInvitation }) {
  const t = useTranslations("Teams");
  const locale = useLocale();
  const router = useRouter();
  const { busy, error, run } = useAction(t("failed"));
  const open = invitation.status === "invited";

  return (
    <article className={`${outlinedPanelClasses} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-center gap-3">
        <UserAvatar name={invitation.invitedBy.fullName} src={invitation.invitedBy.avatarUrl} size={44} />
        <div className="me-auto">
          <p className="font-bold">{t("invitation.from", { name: invitation.invitedBy.fullName })}</p>
          <p className="text-xs text-muted">
            {invitation.team.name} · <span suppressHydrationWarning>{timeAgo(invitation.invitedAt, locale)}</span>
          </p>
        </div>
        <StatusPill tone={MEMBER_STATUS_TONE[invitation.status]}>{t(`memberStatus.${invitation.status}`)}</StatusPill>
      </div>

      <div className={`${softSuccessClasses} flex flex-wrap items-end justify-between gap-4 p-4`}>
        <div>
          <p className="text-xs text-muted">{t("invitation.role")}</p>
          <p className="font-bold">{invitation.roleTitle || t("invitation.noRole")}</p>
        </div>
        <div className="text-end">
          <p className="text-xs text-muted">{t("invitation.share")}</p>
          <p className="text-3xl font-bold text-brand">{invitation.sharePercent}%</p>
        </div>
      </div>
      {invitation.team.description && <p className="text-sm text-muted">{invitation.team.description}</p>}
      {open && invitation.expiresAt && (
        <p className="text-xs text-orange" suppressHydrationWarning>
          {t("invitation.expires", { when: timeAgo(invitation.expiresAt, locale) })}
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/teams/${invitation.team.id}`} className="me-auto text-sm text-link hover:underline">
          {t("invitation.viewTeam")}
        </Link>
        {open && (
          <>
            <Button
              variant="ghost"
              pill
              className="text-danger"
              loading={busy === "decline"}
              onClick={() => run("decline", () => api(`/team-invitations/${invitation.id}/decline`, { method: "POST" }))}
            >
              {t("invitation.decline")}
            </Button>
            <Button
              variant="solid"
              pill
              loading={busy === "accept"}
              onClick={() =>
                run(
                  "accept",
                  () => api(`/team-invitations/${invitation.id}/accept`, { method: "POST" }),
                  () => router.push(`/teams/${invitation.team.id}`),
                )
              }
            >
              {t("invitation.accept")}
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
