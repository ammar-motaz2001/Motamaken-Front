import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { pickParams } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, BarList, Cell, ExportLink, StatCard, money } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

type Analytics = {
  from: string;
  to: string;
  users: { signups: number; byType: Record<string, number>; verified: number; active: number; suspended: number };
  projects: { posted: number; influencerRequests: number; byStatus: Record<string, number>; proposals: number; proposalsByStatus: Record<string, number>; acceptanceRate: number };
  money: { currency: string; deposits: number; withdrawals: number; revenue: number; revenueBySource: Record<string, number>; inEscrowNow: number }[];
  disputes: { opened: number; byReason: Record<string, number>; byResolution: Record<string, number>; avgHoursToResolve: number; appeals: Record<string, number> };
  kyc: { submitted: number; byStatus: Record<string, number>; avgHoursToReview: number };
  reviews: { count: number; average: number; stars: Record<string, number>; hidden: number };
  services: { newSubscriptions: number; activeSubscriptions: number; byPlan: Record<string, number>; promotions: number; promotionsByKind: Record<string, number>; promotionRevenue: Record<string, number> };
  rewards: { pointsEarned: number; pointsSpent: number; medalsAwarded: number };
  moderation: { reports: number; byTarget: Record<string, number>; byStatus: Record<string, number> };
};

const rows = (record: Record<string, number>, label: (key: string) => string) =>
  Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ label: label(key), value }));

export default async function AdminAnalytics({ params, searchParams }: PageProps<"/[locale]/admin/analytics">) {
  setRequestLocale((await params).locale);
  const filter = pickParams(await searchParams, ["from", "to"]);
  const query = new URLSearchParams(filter as Record<string, string>).toString();
  const [t, locale, { data }] = await Promise.all([getTranslations("Admin.analytics"), getLocale(), adminGet<{ data: Analytics }>(`/admin/analytics${query ? `?${query}` : ""}`)]);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const words = (key: string) => key.replaceAll("_", " ");

  return (
    <>
      <AdminHeader
        title={t("title")}
        subtitle={t("period", { from: data.from, to: data.to })}
        actions={(["users", "projects", "proposals", "ledger", "disputes", "reviews", "points"] as const).map((dataset) => (
          <span key={dataset} className="inline-flex items-center gap-1 text-xs text-muted">
            {t(`datasets.${dataset}`)} <ExportLink dataset={dataset} query={filter} />
          </span>
        ))}
      />
      <AdminSection>
        <AdminSearch dates />
      </AdminSection>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("signups")} value={number(data.users.signups)} hint={t("verifiedHint", { count: data.users.verified })} tone="brand" />
        <StatCard label={t("activeUsers")} value={number(data.users.active)} />
        <StatCard label={t("projectsPosted")} value={number(data.projects.posted)} hint={t("influencerHint", { count: data.projects.influencerRequests })} tone="orange" />
        <StatCard label={t("acceptance")} value={`${data.projects.acceptanceRate}%`} hint={t("offersHint", { count: data.projects.proposals })} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminSection title={t("signupsByType")}>
          <BarList format={number} rows={rows(data.users.byType, (k) => t(`types.${k}`))} />
        </AdminSection>
        <AdminSection title={t("projectsByStatus")}>
          <BarList format={number} rows={rows(data.projects.byStatus, words)} />
        </AdminSection>
        <AdminSection title={t("offersByStatus")}>
          <BarList format={number} rows={rows(data.projects.proposalsByStatus, words)} />
        </AdminSection>
      </div>

      <AdminSection title={t("money")}>
        <AdminTable head={[t("currency"), t("deposits"), t("withdrawals"), t("revenue"), t("inEscrow"), t("revenueBySource")]} empty={data.money.length ? false : t("noMoney")}>
          {data.money.map((row) => (
            <tr key={row.currency}>
              <Cell className="font-semibold">{row.currency}</Cell>
              <Cell>{money(row.deposits, row.currency, locale)}</Cell>
              <Cell>{money(row.withdrawals, row.currency, locale)}</Cell>
              <Cell className="font-semibold text-brand">{money(row.revenue, row.currency, locale)}</Cell>
              <Cell>{money(row.inEscrowNow, row.currency, locale)}</Cell>
              <Cell className="text-xs">
                {Object.entries(row.revenueBySource).map(([source, value]) => (
                  <div key={source} className="flex justify-between gap-3">
                    <span className="text-muted capitalize">{words(source)}</span>
                    <span>{money(value, row.currency, locale)}</span>
                  </div>
                ))}
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminSection title={t("disputes")}>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t("opened")} value={number(data.disputes.opened)} />
            <StatCard label={t("hoursToResolve")} value={number(data.disputes.avgHoursToResolve)} />
          </div>
          <BarList format={number} rows={rows(data.disputes.byReason, words)} empty={t("none")} />
          <p className="text-xs font-semibold text-muted uppercase">{t("outcomes")}</p>
          <BarList format={number} rows={rows(data.disputes.byResolution, words)} empty={t("none")} />
          <p className="text-xs font-semibold text-muted uppercase">{t("appeals")}</p>
          <BarList format={number} rows={rows(data.disputes.appeals, words)} empty={t("none")} />
        </AdminSection>
        <AdminSection title={t("kyc")}>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t("submitted")} value={number(data.kyc.submitted)} />
            <StatCard label={t("hoursToReview")} value={number(data.kyc.avgHoursToReview)} />
          </div>
          <BarList format={number} rows={rows(data.kyc.byStatus, words)} empty={t("none")} />
        </AdminSection>
        <AdminSection title={t("reviews")}>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t("average")} value={data.reviews.average ? `${data.reviews.average} ★` : "—"} tone="orange" />
            <StatCard label={t("hidden")} value={number(data.reviews.hidden)} />
          </div>
          <BarList format={number} rows={[5, 4, 3, 2, 1].map((star) => ({ label: "★".repeat(star), value: data.reviews.stars[star] ?? 0, tone: "bg-orange" }))} />
        </AdminSection>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminSection title={t("services")}>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t("newSubscriptions")} value={number(data.services.newSubscriptions)} />
            <StatCard label={t("activeSubscriptions")} value={number(data.services.activeSubscriptions)} tone="brand" />
          </div>
          <BarList format={number} rows={rows(data.services.byPlan, (k) => k)} empty={t("none")} />
        </AdminSection>
        <AdminSection title={t("promotions")}>
          <StatCard label={t("promotionsSold")} value={number(data.services.promotions)} />
          <BarList format={number} rows={rows(data.services.promotionsByKind, words)} empty={t("none")} />
          {Object.entries(data.services.promotionRevenue).map(([currency, value]) => (
            <p key={currency} className="text-sm">
              {t("promotionRevenue")}: <span className="font-semibold">{money(value, currency, locale)}</span>
            </p>
          ))}
        </AdminSection>
        <AdminSection title={t("rewardsAndModeration")}>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label={t("pointsEarned")} value={number(data.rewards.pointsEarned)} />
            <StatCard label={t("pointsSpent")} value={number(data.rewards.pointsSpent)} />
            <StatCard label={t("medals")} value={number(data.rewards.medalsAwarded)} />
          </div>
          <p className="text-xs font-semibold text-muted uppercase">{t("reportsByTarget", { count: data.moderation.reports })}</p>
          <BarList format={number} rows={rows(data.moderation.byTarget, words)} empty={t("none")} />
        </AdminSection>
      </div>
    </>
  );
}
