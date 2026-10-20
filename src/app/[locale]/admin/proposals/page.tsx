import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, StatusTabs, UserCell, dateTime, money, toneFor, type AdminProposal, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const STATUSES = ["pending", "accepted", "declined", "withdrawn"] as const;

export default async function AdminProposals({ params, searchParams }: PageProps<"/[locale]/admin/proposals">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "type", "q", "userId", "projectId"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.proposals"),
    getLocale(),
    adminGet<List<AdminProposal> & { counts: Record<string, number> }>(`/admin/proposals${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="proposals" query={filter} />} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/proposals"
          current={filter.status}
          keep={{ type: filter.type, q: filter.q, userId: filter.userId, projectId: filter.projectId }}
          tabs={[{ value: undefined, label: t("all") }, ...STATUSES.map((value) => ({ value, label: t(`statuses.${value}`), count: result.counts[value] ?? 0 }))]}
        />
        <AdminSearch placeholder={t("search")} filters={[{ name: "type", label: t("anyKind"), options: [{ value: "project", label: t("kinds.project") }, { value: "influencer_request", label: t("kinds.influencer_request") }] }]} />
        <AdminTable head={[t("offer"), t("from"), t("project"), t("amount"), t("state"), t("date")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((p) => (
            <tr key={p.id}>
              <Cell className="max-w-sm text-xs whitespace-pre-line text-muted">
                <span className="line-clamp-3">{p.message}</span>
              </Cell>
              <Cell>
                <UserCell user={p.user} />
                {p.team && <div className="text-xs text-muted">{t("team", { team: p.team.name })}</div>}
              </Cell>
              <Cell className="max-w-xs">
                {p.project ? (
                  <>
                    <Link href={`/admin/projects/${p.project.id}`} className="font-medium hover:text-brand">
                      {p.project.title}
                    </Link>
                    <div className="text-xs text-muted">
                      {t(`kinds.${p.project.type}`)} · {p.project.owner?.fullName}
                    </div>
                  </>
                ) : (
                  "—"
                )}
              </Cell>
              <Cell className="whitespace-nowrap">
                {money(p.amount, p.currency, locale)}
                <div className="text-xs text-muted">{t("days", { count: p.deliveryDays })}</div>
              </Cell>
              <Cell>
                <StatusPill tone={toneFor(p.status)}>{t(`statuses.${p.status}`)}</StatusPill>
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(p.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/proposals" query={filter} />
      </AdminSection>
    </>
  );
}
