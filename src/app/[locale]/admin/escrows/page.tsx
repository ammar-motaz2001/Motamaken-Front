import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatCard, StatusTabs, UserCell, date, money, toneFor, type AdminEscrow, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const STATUSES = ["awaiting_funding", "active", "completed", "cancelled"] as const;

/** Admin › Escrows: every held payment with totals held per currency and filters, from GET /admin/escrows. */
export default async function AdminEscrows({ params, searchParams }: PageProps<"/[locale]/admin/escrows">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "holding", "q"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.escrows"),
    getLocale(),
    adminGet<List<AdminEscrow> & { totals: { currency: string; held: number }[] }>(`/admin/escrows${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {result.totals.length ? (
          result.totals.map((row) => <StatCard key={row.currency} label={t("heldNow", { currency: row.currency })} value={money(row.held, row.currency, locale)} tone="orange" href="/admin/escrows?holding=1" />)
        ) : (
          <StatCard label={t("heldNow", { currency: "" })} value="0" />
        )}
      </div>
      <AdminSection>
        <StatusTabs
          pathname="/admin/escrows"
          current={filter.status}
          keep={{ q: filter.q, holding: filter.holding }}
          tabs={[{ value: undefined, label: t("all") }, ...STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) }))]}
        />
        <AdminSearch placeholder={t("search")} filters={[{ name: "holding", label: t("anyMoney"), options: [{ value: "1", label: t("holdingOnly") }] }]} />
        <AdminTable head={[t("project"), t("client"), t("paidTo"), t("total"), t("held"), t("released"), t("state")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((e) => (
            <tr key={e.id}>
              <Cell className="max-w-xs">
                <Link href={`/admin/escrows/${e.id}`} className="font-medium hover:text-brand">
                  {e.project?.title ?? `#${e.id}`}
                </Link>
                <div className="text-xs text-muted">
                  {Object.entries(e.milestoneStatuses)
                    .map(([status, count]) => `${count} ${t(`milestoneStatus.${status}`)}`)
                    .join(" · ")}
                </div>
              </Cell>
              <Cell>
                <UserCell user={e.client} />
              </Cell>
              <Cell className="text-xs">{e.payees.map((p) => p.user?.fullName).join(", ")}</Cell>
              <Cell className="whitespace-nowrap">{money(e.total, e.currency, locale)}</Cell>
              <Cell className={`whitespace-nowrap ${e.held ? "font-semibold text-orange" : ""}`}>{money(e.held, e.currency, locale)}</Cell>
              <Cell className="whitespace-nowrap">{money(e.released, e.currency, locale)}</Cell>
              <Cell>
                <StatusPill tone={toneFor(e.status)}>{t(`statuses.${e.status}`)}</StatusPill>
                <div className="text-xs text-muted">{date(e.createdAt, locale)}</div>
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/escrows" query={filter} />
      </AdminSection>
    </>
  );
}
