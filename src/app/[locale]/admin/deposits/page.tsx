import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, StatusTabs, UserCell, dateTime, money, toneFor, type AdminDeposit, type List } from "@/modules/admin";
import { adminGet, getAdminPermissions } from "@/modules/admin/server";

const STATUSES = ["pending", "succeeded", "failed"] as const;

export default async function AdminDeposits({ params, searchParams }: PageProps<"/[locale]/admin/deposits">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "userId", "reference", "from", "to"]);
  const can = await getAdminPermissions();
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.deposits"),
    getLocale(),
    adminGet<List<AdminDeposit> & { counts: Record<string, number> }>(`/admin/deposits${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="deposits" query={filter} />} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/deposits"
          current={filter.status}
          keep={{ userId: filter.userId, reference: filter.reference, from: filter.from, to: filter.to }}
          tabs={[{ value: undefined, label: t("all") }, ...STATUSES.map((value) => ({ value, label: t(`statuses.${value}`), count: result.counts[value] ?? 0 }))]}
        />
        <AdminSearch texts={[{ name: "reference", label: t("reference") }]} dates />
        <AdminTable head={[t("user"), t("amount"), t("method"), t("reference"), t("state"), t("date"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((d) => (
            <tr key={d.id}>
              <Cell>
                <UserCell user={d.user} />
              </Cell>
              <Cell className="font-semibold whitespace-nowrap">{money(d.amount, d.currency, locale)}</Cell>
              <Cell className="text-xs">
                {t(`methods.${d.method}`)}
                <div className="text-muted">{d.provider}</div>
              </Cell>
              <Cell className="font-mono text-xs break-all" >
                <span dir="ltr">{d.providerRef}</span>
              </Cell>
              <Cell>
                <StatusPill tone={toneFor(d.status)}>{t(`statuses.${d.status}`)}</StatusPill>
                {d.failureReason && <div className="mt-1 text-xs text-danger">{d.failureReason}</div>}
              </Cell>
              <Cell className="text-xs whitespace-nowrap">
                {dateTime(d.createdAt, locale)}
                {d.paidAt && <div className="text-brand">{t("paidAt", { date: dateTime(d.paidAt, locale) })}</div>}
              </Cell>
              <Cell>{d.status === "pending" && can.has("finance.manage") && <ActionButton label={t("check")} endpoint={`/admin/deposits/${d.id}/refresh`} confirm={t("checkHint")} />}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/deposits" query={filter} />
      </AdminSection>
    </>
  );
}
