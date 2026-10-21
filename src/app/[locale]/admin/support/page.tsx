import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatusTabs, UserCell, dateTime, toneFor, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";
import { SUPPORT_CATEGORIES, type SupportTicket } from "@/modules/support";

const STATUSES = ["open", "answered", "closed"] as const;

/** Admin › Support: user tickets by status with search, from GET /admin/support. */
export default async function AdminSupport({ params, searchParams }: PageProps<"/[locale]/admin/support">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "category", "assigned", "q", "userId"]);
  const status = filter.status ?? "open";
  const [t, ts, locale, result] = await Promise.all([
    getTranslations("Admin.support"),
    getTranslations("Support"),
    getLocale(),
    adminGet<List<SupportTicket> & { counts: Record<string, number> }>(`/admin/support${toQuery({ ...filter, status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/support"
          current={status}
          keep={{ category: filter.category, assigned: filter.assigned, q: filter.q, userId: filter.userId }}
          tabs={STATUSES.map((value) => ({ value, label: ts(`statuses.${value}`), count: result.counts[value] ?? 0 }))}
        />
        <AdminSearch
          placeholder={t("search")}
          filters={[
            { name: "category", label: t("anyCategory"), options: SUPPORT_CATEGORIES.map((value) => ({ value, label: ts(`categories.${value}`) })) },
            { name: "assigned", label: t("anyone"), options: [{ value: "me", label: t("mine") }] },
          ]}
        />
        <AdminTable head={[t("ticket"), t("user"), t("category"), t("assignee"), t("lastActivity")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((ticket) => (
            <tr key={ticket.id}>
              <Cell>
                <Link href={`/admin/support/${ticket.id}`} className="font-medium hover:text-brand">
                  {ticket.subject}
                </Link>
                <div className="text-xs text-muted">#{ticket.id}</div>
              </Cell>
              <Cell>
                <UserCell user={ticket.user} />
              </Cell>
              <Cell>
                <StatusPill tone="muted">{ts(`categories.${ticket.category}`)}</StatusPill>
              </Cell>
              <Cell>{ticket.assignedTo?.fullName ?? <span className="text-muted">—</span>}</Cell>
              <Cell className="whitespace-nowrap">
                {dateTime(ticket.lastMessageAt, locale)}
                <div>
                  <StatusPill tone={toneFor(ticket.status)}>{ts(`statuses.${ticket.status}`)}</StatusPill>
                </div>
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/support" query={{ ...filter, status }} />
      </AdminSection>
    </>
  );
}
