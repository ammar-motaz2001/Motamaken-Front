import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { getCurrencies } from "@/lib/api/reference";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, StatCard, StatusTabs, UserCell, dateTime, money, type AdminPromotion, type List, type PromotionPrices } from "@/modules/admin";
import { PromotionPricesEditor } from "@/modules/admin/components/PromotionPricesEditor";
import { adminGet, getAdminPermissions } from "@/modules/admin/server";

const STATES = ["active", "scheduled", "ended"] as const;

export default async function AdminPromotions({ params, searchParams }: PageProps<"/[locale]/admin/promotions">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["state", "kind", "userId"]);
  const can = await getAdminPermissions();
  const [t, locale, currencies, result, prices] = await Promise.all([
    getTranslations("Admin.promotions"),
    getLocale(),
    getCurrencies(),
    adminGet<List<AdminPromotion> & { summary: { active: number; total: number } }>(`/admin/promotions${toQuery({ ...filter, page: pageParam(query) })}`),
    adminGet<{ data: PromotionPrices }>("/admin/promotions/prices"),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="promotions" query={filter} />} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("runningNow")} value={result.summary.active} tone="brand" href="/admin/promotions?state=active" />
        <StatCard label={t("sold")} value={result.summary.total} />
      </div>
      <AdminSection>
        <StatusTabs
          pathname="/admin/promotions"
          param="state"
          current={filter.state}
          keep={{ kind: filter.kind }}
          tabs={[{ value: undefined, label: t("all") }, ...STATES.map((value) => ({ value, label: t(`states.${value}`) }))]}
        />
        <AdminSearch filters={[{ name: "kind", label: t("anyKind"), options: (["profile", "project"] as const).map((value) => ({ value, label: t(`kinds.${value}`) })) }]} />
        <AdminTable head={[t("buyer"), t("what"), t("price"), t("period"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((p) => (
            <tr key={p.id}>
              <Cell>
                <UserCell user={p.user} />
              </Cell>
              <Cell>
                {t(`kinds.${p.kind}`)}
                {p.package && <span className="text-xs text-muted"> · {p.package}</span>}
                {p.project && (
                  <div>
                    <Link href={`/admin/projects/${p.project.id}`} className="text-xs text-link hover:underline">
                      {p.project.title}
                    </Link>
                  </div>
                )}
              </Cell>
              <Cell className="whitespace-nowrap">
                {money(p.price, p.currency, locale)}
                {p.pointsAwarded > 0 && <div className="text-xs text-muted">+{p.pointsAwarded} {t("pointsShort")}</div>}
              </Cell>
              <Cell className="text-xs whitespace-nowrap">
                {dateTime(p.startsAt, locale)}
                <div>→ {dateTime(p.endsAt, locale)}</div>
              </Cell>
              <Cell>
                <StatusPill tone={p.active ? "success" : "muted"}>{p.active ? t("states.active") : t("states.ended")}</StatusPill>
              </Cell>
              <Cell>{p.active && can.has("finance.manage") && <ActionButton label={t("end")} tone="danger" endpoint={`/admin/promotions/${p.id}/end`} confirm={t("confirmEnd")} />}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/promotions" query={filter} />
      </AdminSection>
      <AdminSection title={t("prices")}>
        <PromotionPricesEditor initial={prices.data} currencies={currencies.map((c) => c.code)} readOnly={!can.has("finance.manage")} />
      </AdminSection>
    </>
  );
}
