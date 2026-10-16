import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { apiGet } from "@/lib/api/server";
import { AdminHeader, AdminSection, AdminTable, Cell, StatCard, UserCell, dateTime, money, type AffiliateOverview } from "@/modules/admin";

export default async function AdminAffiliate({ params }: PageProps<"/[locale]/admin/affiliate">) {
  setRequestLocale((await params).locale);
  const [t, locale, data] = await Promise.all([getTranslations("Admin.affiliate"), getLocale(), apiGet<AffiliateOverview>("/admin/affiliate")]);
  const totals = data.totals;

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label={t("referrers")} value={totals.referrers} />
        <StatCard label={t("referredUsers")} value={totals.referredUsers} />
        <StatCard label={t("qualified")} value={totals.qualifiedReferrals} tone="brand" />
        <StatCard label={t("visits")} value={totals.visits} />
        <StatCard
          label={t("commissions")}
          value={totals.commissions.length ? totals.commissions.map((c) => money(c.amount, c.currency, locale)).join(" · ") : "—"}
          tone="orange"
        />
      </div>
      <AdminSection title={t("top")}>
        <AdminTable head={[t("referrer"), t("tier"), t("qualified"), t("earned")]} empty={data.topReferrers.length ? false : t("empty")}>
          {data.topReferrers.map((row) => (
            <tr key={`${row.userId}-${row.currency}`}>
              <Cell>
                <UserCell user={{ id: row.userId, fullName: row.fullName }} />
              </Cell>
              <Cell className="capitalize">{row.tier ?? "—"}</Cell>
              <Cell>{row.qualifiedReferrals}</Cell>
              <Cell className="text-brand">{money(row.earned, row.currency, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
      <AdminSection title={t("recent")}>
        <AdminTable head={[t("referrer"), t("referred"), t("rate"), t("amount"), t("date")]} empty={data.recent.length ? false : t("empty")}>
          {data.recent.map((row) => (
            <tr key={row.id}>
              <Cell>{row.referrer}</Cell>
              <Cell>{row.referred}</Cell>
              <Cell>{row.ratePercent}%</Cell>
              <Cell className="text-brand">{money(row.amount, row.currency, locale)}</Cell>
              <Cell className="whitespace-nowrap">{dateTime(row.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
    </>
  );
}
