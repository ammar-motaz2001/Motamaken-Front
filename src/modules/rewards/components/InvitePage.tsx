import { getFormatter, getTranslations } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { AffiliateSummary, Paginated } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";
import { ShareLink } from "./ShareLink";

type Referral = { id: number; fullName: string; avatarUrl: string | null; joinedAt: string; verified: boolean; qualified: boolean; earned: number };
type Earning = { id: number; referred: string | null; rate: number; amount: number; currency: string; createdAt: string };

type InvitePageProps = { summary: AffiliateSummary; referrals: Paginated<Referral> | null; earnings: Paginated<Earning> | null; currency: string };

export async function InvitePage({ summary, referrals, earnings, currency }: InvitePageProps) {
  const t = await getTranslations("Rewards.invite");
  const format = await getFormatter();
  const money = (amount: number, code = currency) => format.number(amount, { style: "currency", currency: code });
  const max = Math.max(1, ...summary.monthly.map((row) => row.amount));
  const tierIndex = summary.tiers.findIndex((tier) => tier.code === summary.tier.code);
  const nextMin = summary.tiers[tierIndex + 1]?.min;
  const progress = nextMin ? Math.min(100, (summary.stats.qualified / nextMin) * 100) : 100;

  return (
    <div className="flex flex-col gap-6">
      <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
        <ShareLink link={summary.link} code={summary.code} />
        <ol className="grid gap-3 text-sm sm:grid-cols-3">
          {(["step1", "step2", "step3"] as const).map((step, index) => (
            <li key={step} className="flex gap-2 rounded-lg bg-surface-muted p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{index + 1}</span>
              {t(`steps.${step}`, { percent: summary.tier.percent })}
            </li>
          ))}
        </ol>
      </SettingsPanel>

      <SettingsPanel title={t("dashboard")}>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            [t("stats.visits"), format.number(summary.stats.visits)],
            [t("stats.signups"), format.number(summary.stats.signups)],
            [t("stats.qualified"), format.number(summary.stats.qualified)],
            [t("stats.earnings"), summary.earnings.length ? summary.earnings.map((row) => money(row.amount, row.currency)).join(" · ") : money(0)],
            [t("stats.conversion"), `${summary.stats.conversionRate}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-lg font-bold text-brand" dir="auto">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              {t("tier")} <strong className="text-brand">{t(`tiers.${summary.tier.code}`)}</strong> · {t("commission", { percent: summary.tier.percent })}
            </span>
            {summary.nextTier && <span className="text-xs text-muted">{t("nextTier", { count: summary.nextTier.referralsNeeded, tier: t(`tiers.${summary.nextTier.code}`), percent: summary.nextTier.percent })}</span>}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={t("tierProgress")}>
            <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${progress}%` }} />
          </div>
          <ul className="grid grid-cols-3 gap-2 text-center text-xs">
            {summary.tiers.map((tier) => (
              <li key={tier.code} className={`rounded-lg p-2 ${tier.code === summary.tier.code ? "bg-brand-soft font-bold text-brand" : "bg-surface-muted text-muted"}`}>
                {t(`tiers.${tier.code}`)} · {tier.percent}%
                <span className="block font-normal">{t("fromReferrals", { count: tier.min })}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="flex flex-col gap-2">
          <figcaption className="text-sm font-bold">{t("monthly")}</figcaption>
          <ul className="flex h-40 items-end justify-around gap-2 border-b border-border" dir="ltr">
            {summary.monthly.map((row) => (
              <li key={row.month} className="flex flex-1 flex-col items-center gap-1" title={`${row.month}: ${money(row.amount)}`}>
                <span className="text-[10px] text-muted">{row.amount ? money(row.amount) : ""}</span>
                <span className="w-6 rounded-t bg-chart-income" style={{ height: Math.max(2, (row.amount / max) * 110) }} />
              </li>
            ))}
          </ul>
          <ul className="flex justify-around text-[10px] text-muted" dir="ltr">
            {summary.monthly.map((row) => (
              <li key={row.month} className="flex-1 text-center">
                {format.dateTime(new Date(`${row.month}-01T00:00:00`), { month: "short" })}
              </li>
            ))}
          </ul>
        </figure>
      </SettingsPanel>

      <SettingsPanel title={t("referrals")}>
        {referrals?.data.length ? (
          <ul className="flex flex-col divide-y divide-border">
            {referrals.data.map((person) => (
              <li key={person.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <UserAvatar name={person.fullName} src={person.avatarUrl} size={32} />
                <span className="me-auto">
                  <span className="block font-medium">{person.fullName}</span>
                  <span className="block text-xs text-muted">{t("joined", { date: format.dateTime(new Date(person.joinedAt), { dateStyle: "medium" }) })}</span>
                </span>
                <StatusPill tone={person.qualified ? "success" : person.verified ? "warning" : "muted"}>
                  {t(person.qualified ? "statuses.qualified" : person.verified ? "statuses.joined" : "statuses.pending")}
                </StatusPill>
                <span className="w-24 text-end font-bold" dir="ltr">
                  {money(person.earned)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("noReferrals")}</p>
        )}
      </SettingsPanel>

      {earnings && earnings.data.length > 0 && (
        <SettingsPanel title={t("earnings")}>
          <ul className="flex flex-col divide-y divide-border text-sm">
            {earnings.data.map((row) => (
              <li key={row.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  {row.referred} <span className="text-xs text-muted">· {row.rate}%</span>
                </span>
                <span className="flex gap-4">
                  <span className="text-xs text-muted">{format.dateTime(new Date(row.createdAt), { dateStyle: "medium" })}</span>
                  <span className="font-bold text-brand" dir="ltr">
                    +{money(row.amount, row.currency)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SettingsPanel>
      )}
    </div>
  );
}
