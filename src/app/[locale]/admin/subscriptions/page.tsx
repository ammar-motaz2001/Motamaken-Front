import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, BarList, Cell, ExportLink, StatusTabs, UserCell, date, money, toneFor, type AdminSubscription, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const STATUSES = ["active", "past_due", "cancelled", "expired"] as const;

type ByPlan = { planId: number; plan: string; planAr: string; audience: string; active: number }[];

/** Admin › Subscriptions: every plan subscription with counts by status and by plan, from GET /admin/subscriptions. */
export default async function AdminSubscriptions({ params, searchParams }: PageProps<"/[locale]/admin/subscriptions">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "planId", "userId"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.subscriptions"),
    getLocale(),
    adminGet<List<AdminSubscription> & { counts: Record<string, number>; byPlan: ByPlan }>(`/admin/subscriptions${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);
  const ar = locale === "ar";

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="subscriptions" query={filter} />} />
      <AdminSection title={t("activePerPlan")}>
        <BarList rows={result.byPlan.map((p) => ({ label: `${ar ? p.planAr : p.plan} · ${p.audience}`, value: p.active }))} empty={t("noPlans")} />
      </AdminSection>
      <AdminSection>
        <StatusTabs
          pathname="/admin/subscriptions"
          current={filter.status}
          keep={{ planId: filter.planId }}
          tabs={[{ value: undefined, label: t("all") }, ...STATUSES.map((value) => ({ value, label: t(`statuses.${value}`), count: result.counts[value] ?? 0 }))]}
        />
        <AdminSearch filters={[{ name: "planId", label: t("anyPlan"), options: result.byPlan.map((p) => ({ value: String(p.planId), label: ar ? p.planAr : p.plan })) }]} />
        <AdminTable head={[t("user"), t("plan"), t("state"), t("period"), t("renews"), t("since")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((s) => (
            <tr key={s.id}>
              <Cell>
                <UserCell user={s.user} />
              </Cell>
              <Cell>
                {s.plan ? (ar ? s.plan.nameAr : s.plan.nameEn) : "—"}
                {s.plan && <div className="text-xs text-muted">{money(s.plan.price, s.plan.currency, locale)}</div>}
              </Cell>
              <Cell>
                <StatusPill tone={toneFor(s.status)}>{t(`statuses.${s.status}`)}</StatusPill>
              </Cell>
              <Cell className="text-xs whitespace-nowrap">
                {date(s.currentPeriodStart, locale)} → {date(s.currentPeriodEnd, locale)}
              </Cell>
              <Cell>{s.autoRenew && !s.cancelledAt ? t("yes") : t("no")}</Cell>
              <Cell className="whitespace-nowrap">{date(s.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/subscriptions" query={filter} />
      </AdminSection>
    </>
  );
}
