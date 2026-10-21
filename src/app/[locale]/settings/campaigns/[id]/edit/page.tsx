import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Campaign } from "@/lib/api/types";
import { CampaignForm } from "@/modules/campaigns";
import { SettingsPanel } from "@/modules/settings";

/** Settings › Edit campaign: full edit of a draft from GET /campaigns/{id}; running campaigns go back to the detail page. */
export default async function EditCampaign({ params }: PageProps<"/[locale]/settings/campaigns/[id]/edit">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d+$/.test(id)) notFound();
  const campaign = await apiGetOrNull<{ data: Campaign }>(`/campaigns/${id}`);
  if (!campaign) notFound();
  // Only drafts can change everything; running campaigns edit their filters on the detail page.
  if (campaign.data.status !== "draft") redirect(`${locale === "en" ? "" : `/${locale}`}/settings/campaigns/${id}`);

  const t = await getTranslations("Campaigns.form");
  return (
    <SettingsPanel title={t("editTitle")}>
      <CampaignForm campaign={campaign.data} currency={campaign.data.currency} hasProfile />
    </SettingsPanel>
  );
}
