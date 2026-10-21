"use client";

import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { outlinedPanelClasses, panelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { TextArea } from "@/components/ui/TextArea";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError, FieldErrors } from "@/lib/api/errors";
import type { Team, TeamInvitation } from "@/lib/api/types";
import { TEAM_STATUS_TONE } from "../lib/status";
import { InvitationCard } from "./InvitationCard";

/** Create a team with a name and description (POST /teams), then open it. */
function CreateTeamForm() {
  const t = useTranslations("Teams");
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 3) {
      setErrors({ name: t("create.nameRequired") });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { data } = await api<{ data: Team }>("/teams", {
        method: "POST",
        body: { name: name.trim(), description: description.trim() || null },
      });
      router.push(`/teams/${data.id}`);
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError(apiError.message || t("failed"));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={`${outlinedPanelClasses} flex flex-col gap-4`}>
      <h2 className={sectionTitleClasses}>{t("create.title")}</h2>
      <p className="text-sm text-muted">{t("create.hint")}</p>
      <Field
        label={t("create.name")}
        required
        maxLength={80}
        value={name}
        error={errors.name}
        onChange={(event) => {
          setName(event.target.value);
          setErrors({});
        }}
      />
      <TextArea
        label={t("create.description")}
        rows={3}
        maxLength={1000}
        value={description}
        error={errors.description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div>
        <Button type="submit" variant="solid" pill loading={saving}>
          {t("create.submit")}
        </Button>
      </div>
    </form>
  );
}

/** Teams screen: pending invitations first, the create-team form, then the user's teams. */
export function TeamsPage({ teams, invitations }: { teams: Team[] | null; invitations: TeamInvitation[] | null }) {
  const t = useTranslations("Teams");
  const pending = invitations?.filter((invitation) => invitation.status === "invited") ?? [];

  return (
    <section className={`${panelClasses} flex flex-col gap-6`}>
      <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]} title={t("title")} subtitle={t("subtitle")} />

      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className={sectionTitleClasses}>{t("invitations", { count: pending.length })}</h2>
          {pending.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
          ))}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-3">
          <h2 className={sectionTitleClasses}>{t("myTeams")}</h2>
          {!teams && <p className="text-sm text-muted">{t("failed")}</p>}
          {teams?.length === 0 && (
            <div className={`${outlinedPanelClasses} flex flex-col items-center gap-2 py-10 text-center text-muted`}>
              <Users className="size-10 stroke-1" />
              <p className="text-sm">{t("empty")}</p>
            </div>
          )}
          <ul className="flex flex-col gap-3">
            {teams?.map((team) => (
              <li key={team.id}>
                <Link href={`/teams/${team.id}`} className={`${outlinedPanelClasses} flex flex-wrap items-center gap-3 hover:border-brand`}>
                  <div className="me-auto min-w-0">
                    <p className="truncate font-bold">{team.name}</p>
                    <p className="text-xs text-muted">
                      {t("membersCount", { count: team.members.length })} ·{" "}
                      {team.myMembership?.isLead ? t("youLead") : t("ledBy", { name: team.owner.fullName })}
                    </p>
                  </div>
                  <StatusPill tone={TEAM_STATUS_TONE[team.status]}>{t(`status.${team.status}`)}</StatusPill>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <CreateTeamForm />
      </div>
    </section>
  );
}
