import { getFormatter, getTranslations } from "next-intl/server";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Campaign, PromoterDashboard } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";
import { CampaignStatusPill } from "./CampaignStatusPill";
import { CopyLink } from "./CopyLink";
import { DailyBars } from "./DailyBars";
import { JoinButton } from "./JoinButton";

/** Promoter screen: totals of valid and rejected visits and earnings, the user's links, and campaigns open to join. */
export async function PromoterPage({ dashboard, available }: { dashboard: PromoterDashboard; available: Campaign[] }) {
  const t = await getTranslations("Campaigns.promoter");
  const format = await getFormatter();
  const money = (amount: number, currency: string) => format.number(amount, { style: "currency", currency });
  const joined = new Set(dashboard.links.map((link) => link.campaign?.id));

  return (
    <div className="flex flex-col gap-6">
      <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-gradient-brand p-4 text-white">
            <dt className="text-sm opacity-90">{t("earned")}</dt>
            <dd className="text-2xl font-bold" dir="auto">
              {dashboard.totals.earned.length ? dashboard.totals.earned.map((row) => money(row.amount, row.currency)).join(" · ") : money(0, "USD")}
            </dd>
          </div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted">{t("paid")}</dt>
            <dd className="text-2xl font-bold text-brand">{format.number(dashboard.totals.validVisits)}</dd>
          </div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted">{t("filtered")}</dt>
            <dd className="text-2xl font-bold text-orange">{format.number(dashboard.totals.rejectedVisits)}</dd>
          </div>
        </dl>
        <DailyBars bars={dashboard.daily.map((day) => ({ date: day.date, value: day.visits }))} label={t("daily")} />
        <p className="text-xs text-muted">{t("rules")}</p>
      </SettingsPanel>

      <SettingsPanel title={t("myLinks")}>
        {dashboard.links.length ? (
          <ul className="flex flex-col gap-4">
            {dashboard.links.map((link) => (
              <li key={link.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">{link.campaign?.title}</span>
                  {link.campaign && <CampaignStatusPill status={link.campaign.status} />}
                </div>
                <span className="text-sm text-muted">
                  {t("stats", { valid: link.validVisits, rejected: link.rejectedVisits, earned: money(link.earned, link.campaign?.currency ?? "USD") })}
                </span>
                {link.campaign?.isRunning && <CopyLink link={link.link} />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("noLinks")}</p>
        )}
      </SettingsPanel>

      <SettingsPanel title={t("available")}>
        {available.length ? (
          <ul className="flex flex-col gap-3">
            {available.map((campaign) => (
              <li key={campaign.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
                {campaign.owner && <UserAvatar name={campaign.owner.fullName} src={campaign.owner.avatarUrl} size={40} />}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-bold">{campaign.title}</span>
                  {campaign.description && <span className="line-clamp-2 text-sm text-muted">{campaign.description}</span>}
                  <span className="flex flex-wrap gap-x-4 text-sm">
                    <span className="font-bold text-brand">{t("reward", { amount: money(campaign.rewardPerVisit, campaign.currency) })}</span>
                    <span className="text-muted">{t("remaining", { amount: money(campaign.remaining, campaign.currency) })}</span>
                    {campaign.owner && <span className="text-muted">{t("by", { name: campaign.owner.fullName })}</span>}
                  </span>
                </div>
                {joined.has(campaign.id) ? null : <JoinButton campaignId={campaign.id} />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("noAvailable")}</p>
        )}
      </SettingsPanel>
    </div>
  );
}
