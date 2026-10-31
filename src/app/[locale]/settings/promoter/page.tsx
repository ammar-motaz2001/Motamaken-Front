import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Campaign, Paginated, PromoterDashboard } from "@/lib/api/types";
import { PromoterPage } from "@/modules/campaigns";

/** Browser title of the promoter screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/promoter">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Campaigns.promoter" });
  return { title: t("title") };
}

/** Settings › Promoter: the user's links and earnings from GET /me/promoter and campaigns open to join from /campaigns/available. */
export default async function Promoter({ params }: PageProps<"/[locale]/settings/promoter">) {
  setRequestLocale((await params).locale);
  const [dashboard, available] = await Promise.all([
    apiGetOrNull<PromoterDashboard>("/me/promoter"),
    apiGetOrNull<Paginated<Campaign>>("/campaigns/available?perPage=20"),
  ]);

  return (
    <PromoterPage
      dashboard={dashboard ?? { totals: { validVisits: 0, rejectedVisits: 0, earned: [] }, links: [], daily: [] }}
      available={available?.data ?? []}
    />
  );
}
