import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatusTabs, UserCell, date, toneFor, type AdminTeam, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const STATUSES = ["active", "draft", "disbanded"] as const;

/** Admin › Teams: every team with search, from GET /admin/teams. */
export default async function AdminTeams({ params, searchParams }: PageProps<"/[locale]/admin/teams">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "q"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.teams"),
    getLocale(),
    adminGet<List<AdminTeam>>(`/admin/teams${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs pathname="/admin/teams" current={filter.status} keep={{ q: filter.q }} tabs={[{ value: undefined, label: t("all") }, ...STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) }))]} />
        <AdminSearch placeholder={t("search")} />
        <AdminTable head={[t("team"), t("owner"), t("members"), t("offers"), t("state"), t("created")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((team) => (
            <tr key={team.id}>
              <Cell>
                <Link href={`/admin/teams/${team.id}`} className="font-medium hover:text-brand">
                  {team.name}
                </Link>
              </Cell>
              <Cell>
                <UserCell user={team.owner} />
              </Cell>
              <Cell>{team.members}</Cell>
              <Cell>{team.proposals}</Cell>
              <Cell>
                <StatusPill tone={toneFor(team.status)}>{t(`statuses.${team.status}`)}</StatusPill>
              </Cell>
              <Cell className="whitespace-nowrap">{date(team.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/teams" query={filter} />
      </AdminSection>
    </>
  );
}
