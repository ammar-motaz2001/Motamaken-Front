import { useTranslations } from "next-intl";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import type { CampaignStatus } from "@/lib/api/types";

const TONES: Record<CampaignStatus, StatusTone> = {
  draft: "muted",
  active: "success",
  paused: "warning",
  completed: "muted",
  cancelled: "danger",
};

/** Status label of a campaign in its colour (draft, active, paused...). */
export function CampaignStatusPill({ status }: { status: CampaignStatus }) {
  const t = useTranslations("Campaigns.statuses");
  return <StatusPill tone={TONES[status]}>{t(status)}</StatusPill>;
}
