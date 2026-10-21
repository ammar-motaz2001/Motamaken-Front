import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { apiGet } from "@/lib/api/server";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, StatCard, UserCell, dateTime, money, type AffiliateOverview, type Person } from "@/modules/admin";

type Suspicious = { user: Person; referrer: Person | null; reasons: string[]; sharedIps: string[]; createdAt: string; revoked: boolean };

/** Admin › Affiliate: referral totals, top referrers and suspicious referrals to revoke, from GET /admin/affiliate. */
export default async function AdminAffiliate({ params }: PageProps<"/[locale]/admin/affiliate">) {
  setRequestLocale((await params).locale);
  const [t, locale, data, suspicious] = await Promise.all([
    getTranslations("Admin.affiliate"),
    getLocale(),
    apiGet<AffiliateOverview>("/admin/affiliate"),
    apiGet<{ data: Suspicious[] }>("/admin/affiliate/suspicious"),
  ]);
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
      <AdminSection title={t("suspicious")}>
        <p className="text-sm text-muted">{t("suspiciousHint")}</p>
        <AdminTable head={[t("invited"), t("invitedBy"), t("signals"), t("date"), ""]} empty={suspicious.data.length ? false : t("noSuspicious")}>
          {suspicious.data.map((row) => (
            <tr key={row.user.id}>
              <Cell>
                <UserCell user={row.user} />
              </Cell>
              <Cell>
                <UserCell user={row.referrer} />
              </Cell>
              <Cell className="text-xs">
                {row.reasons.map((reason) => (
                  <div key={reason} className="text-orange">
                    {t(`signalNames.${reason}`)}
                  </div>
                ))}
                {row.sharedIps.length > 0 && <div className="text-muted" dir="ltr">{row.sharedIps.join(", ")}</div>}
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(row.createdAt, locale)}</Cell>
              <Cell>
                {row.revoked ? (
                  <span className="text-xs text-muted">{t("revoked")}</span>
                ) : (
                  <ActionButton
                    label={t("revoke")}
                    tone="danger"
                    endpoint={`/admin/affiliate/referrals/${row.user.id}/revoke`}
                    description={t("revokeHint")}
                    fields={[{ name: "reason", label: t("reason"), type: "text", required: true, defaultValue: t("selfReferral") }]}
                  />
                )}
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
    </>
  );
}
