"use client";

import { confirmDialog } from "@/components/ui/ConfirmDialog";
import { ReportButton } from "@/modules/reports/components/ReportButton";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShareStepper } from "@/components/ui/ShareStepper";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  outlinedPanelClasses,
  panelClasses,
  sectionTitleClasses,
  softSuccessClasses,
  softWarningClasses,
} from "@/components/ui/styles";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { Team } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { MEMBER_STATUS_TONE, TEAM_STATUS_TONE } from "../lib/status";
import { useAction } from "../lib/useAction";
import { InviteMemberForm } from "./InviteMemberForm";

const MIN_LEAD_SHARE = 1;
const ACTIVE_STATUSES = ["invited", "accepted"];

type Member = Team["members"][number];

/** One member row: share and role editable by the lead while the team is a draft, plus resend or remove. */
function MemberRow({ team, member, editable }: { team: Team; member: Member; editable: boolean }) {
  const t = useTranslations("Teams");
  const locale = useLocale();
  const [share, setShare] = useState(member.sharePercent);
  const [role, setRole] = useState(member.roleTitle ?? "");
  const { busy, error, run } = useAction(t("failed"));
  const dirty = share !== member.sharePercent || role !== (member.roleTitle ?? "");
  const base = `/teams/${team.id}/members/${member.id}`;

  return (
    <tr className="[&>td]:border-y [&>td]:border-border [&>td]:bg-surface">
      <td className="rounded-s-lg border-s px-4 py-3">
        <span className="flex items-center gap-2">
          <UserAvatar name={member.user.fullName} src={member.user.avatarUrl} size={32} />
          <span className="flex flex-col">
            <span className="font-bold">{member.user.fullName}</span>
            <span className="text-xs text-muted">{member.isLead ? t("lead") : member.user.jobTitle}</span>
          </span>
        </span>
      </td>
      <td className="px-4 py-3">
        {editable && !member.isLead ? (
          <input
            value={role}
            maxLength={80}
            aria-label={t("columns.role")}
            onChange={(event) => setRole(event.target.value)}
            className="w-36 rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-brand"
          />
        ) : (
          <span className="text-muted">{member.roleTitle || "—"}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editable && !member.isLead ? (
          <ShareStepper label={t("columns.share")} value={share} step={1} min={1} max={98} onChange={setShare} />
        ) : (
          <span className="font-bold">{member.sharePercent}%</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusPill tone={MEMBER_STATUS_TONE[member.status]}>{t(`memberStatus.${member.status}`)}</StatusPill>
        {member.status === "invited" && member.expiresAt && (
          <p className="mt-1 text-[11px] text-muted" suppressHydrationWarning>
            {t("expires", { when: timeAgo(member.expiresAt, locale) })}
          </p>
        )}
        {error && <p className="mt-1 max-w-48 text-xs text-danger">{error}</p>}
      </td>
      <td className="rounded-e-lg border-e px-4 py-3 text-end">
        {editable && !member.isLead && (
          <span className="flex flex-wrap justify-end gap-2">
            {dirty && (
              <Button
                variant="solid"
                pill
                className="min-h-8 px-3 py-1 text-xs"
                loading={busy === "save"}
                onClick={() =>
                  run("save", () => api(base, { method: "PATCH", body: { sharePercent: share, roleTitle: role.trim() || null } }))
                }
              >
                {t("save")}
              </Button>
            )}
            {member.status !== "accepted" && (
              <button
                type="button"
                disabled={busy === "resend"}
                onClick={() => run("resend", () => api(`${base}/resend`, { method: "POST" }))}
                className="text-sm text-brand hover:underline disabled:opacity-50"
              >
                {t("resend")}
              </button>
            )}
            <button
              type="button"
              disabled={busy === "remove"}
              onClick={async () => (await confirmDialog(t("confirmRemove"))) && run("remove", () => api(base, { method: "DELETE" }))}
              className="text-sm text-danger hover:underline disabled:opacity-50"
            >
              {t("remove")}
            </button>
          </span>
        )}
      </td>
    </tr>
  );
}

/**
 * Team page: members and shares, invite form and publish/unpublish/disband for the lead, leave for the others;
 * shares are capped so the lead keeps a minimum.
 */
export function TeamDetail({ team }: { team: Team }) {
  const t = useTranslations("Teams");
  const router = useRouter();
  const { busy, error, run } = useAction(t("failed"));
  const isLead = team.myMembership?.isLead ?? false;
  const editable = isLead && team.status === "draft";
  const counted = team.members.filter((member) => ACTIVE_STATUSES.includes(member.status));
  const othersShare = counted.filter((member) => !member.isLead).reduce((sum, member) => sum + member.sharePercent, 0);
  const maxShare = Math.max(0, 100 - MIN_LEAD_SHARE - othersShare);
  const action = (key: string, path: string, after?: () => void) => run(key, () => api(`/teams/${team.id}/${path}`, { method: "POST" }), after);
  const membership = team.myMembership;

  return (
    <section className={`${panelClasses} flex flex-col gap-6`}>
      <PageHeader
        crumbs={[{ label: t("home"), href: "/" }, { label: t("title"), href: "/teams" }, { label: team.name }]}
        title={team.name}
        subtitle={team.description ?? undefined}
        actions={
          <span className="flex items-center gap-3">
            {!isLead && <ReportButton targetType="team" targetId={team.id} />}
            <StatusPill tone={TEAM_STATUS_TONE[team.status]}>{t(`status.${team.status}`)}</StatusPill>
          </span>
        }
      />

      {membership && !membership.isLead && membership.status === "invited" && (
        <div className={`${softWarningClasses} flex flex-wrap items-center justify-between gap-3 p-4`}>
          <p className="text-sm font-medium text-orange">{t("invitedBanner", { name: team.owner.fullName })}</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              pill
              className="text-danger"
              loading={busy === "decline"}
              onClick={() => run("decline", () => api(`/team-invitations/${membership.id}/decline`, { method: "POST" }))}
            >
              {t("invitation.decline")}
            </Button>
            <Button
              variant="solid"
              pill
              loading={busy === "accept"}
              onClick={() => run("accept", () => api(`/team-invitations/${membership.id}/accept`, { method: "POST" }))}
            >
              {t("invitation.accept")}
            </Button>
          </div>
        </div>
      )}

      {isLead && team.status === "draft" && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 p-4 ${team.readiness.ready ? softSuccessClasses : softWarningClasses}`}
        >
          <div className="flex items-start gap-2">
            {team.readiness.ready ? (
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
            ) : (
              <CircleAlert size={18} className="mt-0.5 shrink-0 text-orange" aria-hidden />
            )}
            <div>
              <p className={`font-bold ${team.readiness.ready ? "text-brand" : "text-orange"}`}>
                {t(team.readiness.ready ? "ready" : "notReady")}
              </p>
              <ul className="text-xs text-muted">
                {team.readiness.blockers.map((blocker) => (
                  <li key={blocker}>• {t(`blockers.${blocker}`)}</li>
                ))}
              </ul>
            </div>
          </div>
          <Button variant="solid" pill disabled={!team.readiness.ready} loading={busy === "publish"} onClick={() => action("publish", "publish")}>
            {t("publish")}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={sectionTitleClasses}>{t("members")}</h2>
          <span dir="ltr" className="text-sm text-muted">
            {t("shareSummary", { others: othersShare, lead: 100 - othersShare })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="bg-surface-muted text-xs text-muted">
                <th className="rounded-s-md px-4 py-3 text-start font-medium">{t("columns.member")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("columns.role")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("columns.share")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("columns.status")}</th>
                <th className="rounded-e-md px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {team.members.map((member) => (
                <MemberRow
                  key={`${member.id}-${member.sharePercent}-${member.roleTitle}`}
                  team={team}
                  member={member}
                  editable={editable}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className={`${outlinedPanelClasses} flex flex-col gap-3`}>
          <h3 className="font-bold">{t("rulesTitle")}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {(t.raw("rules") as string[]).map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                {rule}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-3">
            {isLead && team.status === "active" && (
              <Button variant="outline" pill loading={busy === "unpublish"} onClick={() => action("unpublish", "unpublish")}>
                {t("unpublish")}
              </Button>
            )}
            {isLead && team.status !== "disbanded" && (
              <Button
                variant="ghost"
                pill
                className="text-danger"
                loading={busy === "disband"}
                onClick={async () => (await confirmDialog(t("confirmDisband"))) && action("disband", "disband")}
              >
                {t("disband")}
              </Button>
            )}
            {membership && !membership.isLead && membership.status === "accepted" && team.status !== "disbanded" && (
              <Button
                variant="ghost"
                pill
                className="text-danger"
                loading={busy === "leave"}
                onClick={async () => (await confirmDialog(t("confirmLeave"))) && action("leave", "leave", () => router.replace("/teams"))}
              >
                {t("leave")}
              </Button>
            )}
          </div>
        </div>
        {editable && (
          <InviteMemberForm
            teamId={team.id}
            maxShare={maxShare}
            excludeIds={team.members.filter((member) => ACTIVE_STATUSES.includes(member.status)).map((member) => member.user.id)}
          />
        )}
      </div>
    </section>
  );
}
