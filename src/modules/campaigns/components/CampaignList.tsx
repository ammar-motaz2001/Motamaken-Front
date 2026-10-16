import { Plus } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import type { Campaign } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";
import { CampaignStatusPill } from "./CampaignStatusPill";

const STATUSES = ["active", "paused", "draft", "completed", "cancelled"] as const;

export async function CampaignList({ campaigns, status }: { campaigns: Campaign[]; status?: string }) {
  const t = await getTranslations("Campaigns");
  const format = await getFormatter();
  const money = (amount: number, currency: string) => format.number(amount, { style: "currency", currency });

  return (
    <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1.5 text-sm" aria-label={t("title")}>
          {[undefined, ...STATUSES].map((value) => (
            <Link
              key={value ?? "all"}
              href={value ? `/settings/campaigns?status=${value}` : "/settings/campaigns"}
              aria-current={status === value ? "page" : undefined}
              className={`rounded-full border px-3 py-1 ${status === value ? "border-brand bg-brand-soft font-medium text-brand" : "border-border hover:border-brand"}`}
            >
              {value ? t(`statuses.${value}`) : t("statusFilter.all")}
            </Link>
          ))}
        </nav>
        <Button variant="solid" font="button" href="/settings/campaigns/new">
          <Plus className="size-4" />
          {t("new")}
        </Button>
      </div>

      {campaigns.length ? (
        <ul className="flex flex-col gap-3">
          {campaigns.map((campaign) => {
            const used = campaign.budget ? Math.min(100, (campaign.spent / campaign.budget) * 100) : 0;
            return (
              <li key={campaign.id}>
                <Link href={`/settings/campaigns/${campaign.id}`} className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:border-brand">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">{campaign.title}</span>
                    <CampaignStatusPill status={campaign.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                    <span>{t(`target.${campaign.target.type}`)}</span>
                    <span>{t("perVisit", { amount: money(campaign.costPerVisit, campaign.currency) })}</span>
                    {campaign.stats && <span>{t("visits", { valid: campaign.stats.validVisits, rejected: campaign.stats.rejectedVisits })}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={Math.round(used)} aria-valuemin={0} aria-valuemax={100} aria-label={t("detail.spent")}>
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${used}%` }} />
                    </div>
                    <span className="text-xs text-muted">{t("budgetUsed", { spent: money(campaign.spent, campaign.currency), budget: money(campaign.budget, campaign.currency) })}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t("empty")}</p>
      )}
    </SettingsPanel>
  );
}
