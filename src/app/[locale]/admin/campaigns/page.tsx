import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import type { Campaign } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, StatusTabs, UserCell, date, money, toneFor, type List } from "@/modules/admin";

const STATUSES = ["active", "paused", "draft", "completed", "cancelled"] as const;

export default async function AdminCampaigns({ params, searchParams }: PageProps<"/[locale]/admin/campaigns">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const status = pickParams(query, ["status"]).status;
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.campaigns"),
    getLocale(),
    apiGet<List<Campaign>>(`/admin/campaigns${toQuery({ status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs pathname="/admin/campaigns" current={status} tabs={[{ value: undefined, label: t("all") }, ...STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))]} />
        <AdminTable head={[t("campaign"), t("owner"), t("budget"), t("visits"), t("created"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((c) => (
            <tr key={c.id}>
              <Cell className="max-w-xs">
                <div className="font-medium">{c.title}</div>
                <Link href={c.target.path} className="text-xs text-link hover:underline">
                  {t(`targets.${c.target.type}`)} #{c.target.id}
                </Link>
              </Cell>
              <Cell>
                <UserCell user={c.owner} />
              </Cell>
              <Cell className="whitespace-nowrap">
                <div>{money(c.spent, c.currency, locale)} / {money(c.budget, c.currency, locale)}</div>
                <div className="text-xs text-muted">{t("perVisit", { cost: money(c.costPerVisit, c.currency, locale) })}</div>
              </Cell>
              <Cell>
                {c.stats ? (
                  <>
                    <div className="text-brand">{c.stats.validVisits}</div>
                    <div className="text-xs text-muted">{t("rejected", { count: c.stats.rejectedVisits })}</div>
                  </>
                ) : (
                  "—"
                )}
              </Cell>
              <Cell className="whitespace-nowrap">{date(c.createdAt, locale)}</Cell>
              <Cell>
                <StatusPill tone={toneFor(c.status)}>{t(`status.${c.status}`)}</StatusPill>
              </Cell>
              <Cell className="text-end">
                {(c.status === "active" || c.status === "paused" || c.status === "draft") && (
                  <ActionButton label={t("cancel")} endpoint={`/admin/campaigns/${c.id}/cancel`} tone="danger" confirm={t("confirmCancel", { title: c.title })} />
                )}
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/campaigns" query={{ status }} />
      </AdminSection>
    </>
  );
}
