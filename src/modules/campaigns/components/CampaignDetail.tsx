import { getFormatter, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import type { Campaign, CampaignVisit, Paginated } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";
import { CampaignActions } from "./CampaignActions";
import { CampaignStatusPill } from "./CampaignStatusPill";
import { DailyBars } from "./DailyBars";
import { FilterSettings } from "./FilterSettings";
import { RejectionDonut } from "./RejectionDonut";

type Daily = { date: string; valid: number; rejected: number; spent: number };

type Props = {
  campaign: Campaign;
  daily: Daily[];
  visits: Paginated<CampaignVisit> | null;
  visitFilter: { status?: string; reason?: string };
  /** Staff view from the admin panel: no owner actions or filter editing, links stay in the panel. */
  readOnly?: boolean;
};

/**
 * Campaign detail: status and actions (launch, pause, resume, cancel), spend, the daily chart, rejection reasons and the visit log;
 * filters stay editable while it runs.
 */
export async function CampaignDetail({ campaign, daily, visits, visitFilter, readOnly = false }: Props) {
  const t = await getTranslations("Campaigns");
  const format = await getFormatter();
  const money = (amount: number) => format.number(amount, { style: "currency", currency: campaign.currency });
  const stats = campaign.stats;
  const base = readOnly ? `/admin/campaigns/${campaign.id}` : `/settings/campaigns/${campaign.id}`;
  const editable = !readOnly && (campaign.status === "active" || campaign.status === "paused");

  return (
    <div className="flex flex-col gap-6">
      <SettingsPanel title={campaign.title} subtitle={campaign.description ?? undefined}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1 text-sm">
            <CampaignStatusPill status={campaign.status} />
            <span className="text-muted">
              {t("detail.link")}{" "}
              <Link href={campaign.target.path} className="font-medium text-brand hover:underline">
                {t(`target.${campaign.target.type}`)} #{campaign.target.id}
              </Link>
            </span>
            {campaign.endsAt && <span className="text-muted">{t("detail.ends", { date: format.dateTime(new Date(campaign.endsAt), { dateStyle: "medium" }) })}</span>}
          </div>
          {!readOnly && <CampaignActions campaign={campaign} />}
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [t("detail.budget"), money(campaign.budget)],
            [t("detail.spent"), money(campaign.spent)],
            [t("detail.remaining"), money(campaign.remaining)],
            [t("detail.costPerVisit"), `${money(campaign.costPerVisit)} · ${t("detail.reward")} ${money(campaign.rewardPerVisit)}`],
            [t("detail.visits"), format.number(stats?.visits ?? 0)],
            [t("detail.valid"), format.number(stats?.validVisits ?? 0)],
            [t("detail.rejected"), format.number(stats?.rejectedVisits ?? 0)],
            [t("detail.validRate"), `${stats?.validRate ?? 0}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-bold text-brand" dir="auto">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </SettingsPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsPanel title={t("detail.why")}>
          <RejectionDonut rejections={stats?.rejections ?? []} />
        </SettingsPanel>
        <SettingsPanel title={t("detail.daily")}>
          <DailyBars bars={daily.map((day) => ({ date: day.date, value: day.valid, secondary: day.rejected }))} label={`${t("detail.valid")} / ${t("detail.rejected")}`} />
        </SettingsPanel>
      </div>

      {editable && (
        <SettingsPanel title={t("form.filtersTitle")} subtitle={t("form.filtersHint")}>
          <FilterSettings campaign={campaign} />
        </SettingsPanel>
      )}

      <SettingsPanel title={t("detail.topPromoters")}>
        {stats?.topPromoters?.length ? (
          <ul className="flex flex-col divide-y divide-border">
            {stats.topPromoters.map((promoter) => (
              <li key={promoter.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <UserAvatar name={promoter.user?.fullName ?? ""} src={promoter.user?.avatarUrl ?? null} size={32} />
                <span className="me-auto font-medium">{promoter.user?.fullName}</span>
                <span className="text-muted">{t("visits", { valid: promoter.validVisits, rejected: promoter.rejectedVisits })}</span>
                <span className="w-24 text-end font-bold" dir="ltr">
                  {money(promoter.earned)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("detail.noPromoters")}</p>
        )}
      </SettingsPanel>

      <SettingsPanel title={t("detail.visitsLog")}>
        <nav className="flex flex-wrap gap-1.5 text-sm" aria-label={t("detail.visitsLog")}>
          {[
            [undefined, t("detail.all")],
            ["valid", t("detail.paid")],
            ["rejected", t("detail.filtered")],
          ].map(([value, label]) => (
            <Link
              key={label}
              href={value ? `${base}?status=${value}` : base}
              aria-current={visitFilter.status === value && !visitFilter.reason ? "page" : undefined}
              className={`rounded-full border px-3 py-1 ${visitFilter.status === value && !visitFilter.reason ? "border-brand bg-brand-soft font-medium text-brand" : "border-border hover:border-brand"}`}
            >
              {label}
            </Link>
          ))}
          {(stats?.rejections ?? []).map((row) => (
            <Link
              key={row.reason}
              href={`${base}?reason=${row.reason}`}
              aria-current={visitFilter.reason === row.reason ? "page" : undefined}
              className={`rounded-full border px-3 py-1 ${visitFilter.reason === row.reason ? "border-orange bg-orange/10 font-medium text-orange" : "border-border hover:border-orange"}`}
            >
              {row.label} ({row.count})
            </Link>
          ))}
        </nav>

        {visits?.data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-start text-xs text-muted">
                <tr className="border-b border-border">
                  {(["time", "promoter", "visitor", "country", "from", "result"] as const).map((column) => (
                    <th key={column} className="py-2 text-start font-medium">
                      {t(`detail.columns.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visits.data.map((visit) => (
                  <tr key={visit.id} className="border-b border-border last:border-0">
                    <td className="py-2 whitespace-nowrap text-muted">{format.dateTime(new Date(visit.createdAt), { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="py-2">{visit.promoter?.fullName}</td>
                    <td className="py-2 font-mono text-xs" dir="ltr">
                      {visit.visitor}
                    </td>
                    <td className="py-2">{visit.country ?? "—"}</td>
                    <td className="py-2 text-muted" dir="ltr">
                      {visit.referrer ?? "—"}
                    </td>
                    <td className="py-2">
                      {visit.status === "valid" ? <StatusPill tone="success">+{money(visit.reward)}</StatusPill> : <StatusPill tone="warning">{visit.rejectLabel}</StatusPill>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("detail.noVisits")}</p>
        )}
        {visits && <Pagination page={visits.meta.current_page} lastPage={visits.meta.last_page} pathname={base} query={visitFilter} />}
      </SettingsPanel>
    </div>
  );
}
