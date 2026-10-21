import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, InfoGrid, UserCell, dateTime, money, toneFor, type AdminTeamDetail } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

/** Admin › Team: members, projects and disband/remove-member actions, from GET /admin/teams/{id}. */
export default async function AdminTeamPage({ params }: PageProps<"/[locale]/admin/teams/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const [t, locale, { data: team }] = await Promise.all([getTranslations("Admin.teams"), getLocale(), adminGet<{ data: AdminTeamDetail }>(`/admin/teams/${id}`)]);
  const when = (value: string | null) => dateTime(value, locale);

  return (
    <>
      <AdminHeader
        title={team.name}
        subtitle={`#${team.id}`}
        actions={
          team.status !== "disbanded" && (
            <ActionButton label={t("disband")} tone="danger" endpoint={`/admin/teams/${team.id}/disband`} description={t("disbandHint")} fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true }]} />
          )
        }
      />
      <AdminSection>
        <InfoGrid
          columns={4}
          items={[
            { label: t("owner"), value: <UserCell user={team.owner} /> },
            { label: t("state"), value: <StatusPill tone={toneFor(team.status)}>{t(`statuses.${team.status}`)}</StatusPill> },
            { label: t("published"), value: when(team.publishedAt) },
            { label: t("created"), value: when(team.createdAt) },
            { label: t("description"), value: team.description, wide: true },
          ]}
        />
      </AdminSection>
      <AdminSection title={t("membersAndInvites")}>
        <AdminTable head={[t("member"), t("role"), t("share"), t("state"), t("answered"), ""]}>
          {team.members.map((m) => (
            <tr key={m.id}>
              <Cell>
                <UserCell user={m.user} />
                {m.isLead && <span className="text-xs text-brand">{t("lead")}</span>}
              </Cell>
              <Cell>{m.roleTitle ?? "—"}</Cell>
              <Cell>{m.sharePercent}%</Cell>
              <Cell>
                <StatusPill tone={toneFor(m.status)}>{t(`memberStatus.${m.status}`)}</StatusPill>
                {m.status === "invited" && m.expiresAt && <div className="text-xs text-muted">{t("expires", { date: when(m.expiresAt) })}</div>}
              </Cell>
              <Cell className="whitespace-nowrap">{when(m.respondedAt)}</Cell>
              <Cell>{!m.isLead && team.status !== "disbanded" && <ActionButton label={t("remove")} tone="danger" method="DELETE" endpoint={`/admin/teams/${team.id}/members/${m.id}`} confirm={t("confirmRemove")} />}</Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
      <div className="grid gap-5 xl:grid-cols-2">
        <AdminSection title={t("offers")}>
          {team.proposals.length ? (
            <ul className="flex flex-col gap-2">
              {team.proposals.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projects/${p.projectId}`} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm hover:border-brand">
                    <span>
                      {p.project}
                      <span className="block text-xs text-muted">{money(p.amount, p.currency, locale)}</span>
                    </span>
                    <StatusPill tone={toneFor(p.status)}>{p.status}</StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("none")}</p>
          )}
        </AdminSection>
        <AdminSection title={t("groupChats")}>
          <p className="text-xs text-muted">{t("privacy")}</p>
          {team.groupChats.length ? (
            <ul className="flex flex-col gap-2 text-sm">
              {team.groupChats.map((c) => (
                <li key={c.id} className="flex justify-between gap-2 rounded-lg border border-border p-3">
                  <span>{c.title ?? `#${c.id}`}</span>
                  <span className="text-xs text-muted">
                    {t("messagesCount", { count: c.messages })} · {when(c.lastMessageAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("none")}</p>
          )}
        </AdminSection>
      </div>
      <AdminSection title={t("reports")}>
        {team.reports.length ? (
          <ul className="flex flex-col gap-2">
            {team.reports.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                <span>
                  {r.reason} · {r.reporter?.fullName}
                  {r.details && <span className="block text-xs text-muted">{r.details}</span>}
                </span>
                <StatusPill tone={toneFor(r.status)}>{r.status}</StatusPill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("none")}</p>
        )}
      </AdminSection>
    </>
  );
}
