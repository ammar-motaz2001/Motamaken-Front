import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import { CampaignForm } from "@/modules/campaigns";
import { SettingsPanel } from "@/modules/settings";

/** Browser title of the new campaign screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/campaigns/new">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Campaigns.form" });
  return { title: `${t("createTitle")} | Mutamakin` };
}

/** Settings › New campaign: the campaign form in the wallet's currency; warns when the user has no profile to promote. */
export default async function NewCampaign({ params }: PageProps<"/[locale]/settings/campaigns/new">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("Campaigns.form");
  const [summary, profile] = await Promise.all([getSummary(), apiGetOrNull<{ data: { id: number } }>("/me/profile")]);

  return (
    <SettingsPanel title={t("createTitle")}>
      <CampaignForm currency={summary?.wallet.currency ?? "USD"} hasProfile={Boolean(profile)} />
    </SettingsPanel>
  );
}
