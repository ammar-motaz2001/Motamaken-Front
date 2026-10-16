import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import type { Dispute } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSection, AdminTable, Cell, StatusTabs, UserCell, dateTime, money, toneFor, type List } from "@/modules/admin";

const STATUSES = ["open", "under_review", "resolved", "withdrawn"] as const;

export default async function AdminDisputes({ params, searchParams }: PageProps<"/[locale]/admin/disputes">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const status = pickParams(query, ["status"]).status;
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.disputes"),
    getLocale(),
    apiGet<List<Dispute>>(`/admin/disputes${toQuery({ status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/disputes"
          current={status}
          tabs={[{ value: undefined, label: t("active") }, ...STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))]}
        />
        <AdminTable head={[t("case"), t("openedBy"), t("against"), t("amount"), t("opened"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((d) => (
            <tr key={d.id}>
              <Cell>
                <div className="font-semibold">{d.caseNumber}</div>
                <div className="max-w-56 truncate text-xs text-muted">{d.project?.title}</div>
              </Cell>
              <Cell>
                <UserCell user={d.openedBy} />
              </Cell>
              <Cell>
                <UserCell user={d.against} />
              </Cell>
              <Cell className="whitespace-nowrap">{d.milestone && d.currency ? money(d.milestone.amount, d.currency, locale) : "—"}</Cell>
              <Cell className="whitespace-nowrap">{dateTime(d.createdAt, locale)}</Cell>
              <Cell>
                <StatusPill tone={toneFor(d.status)}>{t(`status.${d.status}`)}</StatusPill>
                {d.assignedTo && <div className="mt-1 text-xs text-muted">{d.assignedTo.fullName}</div>}
              </Cell>
              <Cell className="text-end">
                <Link href={`/admin/disputes/${d.id}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
                  {t("open")}
                </Link>
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/disputes" query={{ status }} />
      </AdminSection>
    </>
  );
}
