import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Campaign, CampaignVisit, Paginated } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { CampaignDetail } from "@/modules/campaigns";

type Daily = { currency: string; data: { date: string; valid: number; rejected: number; spent: number }[] };

/** Browser title of a campaign's detail screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/campaigns/[id]">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Campaigns" });
  return { title: t("title") };
}

/** Settings › Campaign: stats, 14-day chart and visit log from GET /campaigns/{id} and its /daily and /visits lists. */
export default async function CampaignPage({ params, searchParams }: PageProps<"/[locale]/settings/campaigns/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d+$/.test(id)) notFound();
  const query = await searchParams;
  const filter = pickParams(query, ["status", "reason"]);

  const [campaign, daily, visits] = await Promise.all([
    apiGetOrNull<{ data: Campaign }>(`/campaigns/${id}`),
    apiGetOrNull<Daily>(`/campaigns/${id}/daily?days=14`),
    apiGetOrNull<Paginated<CampaignVisit>>(`/campaigns/${id}/visits${toQuery({ ...filter, perPage: "20", page: pageParam(query) })}`),
  ]);
  if (!campaign) notFound();

  return <CampaignDetail campaign={campaign.data} daily={daily?.data ?? []} visits={visits} visitFilter={filter} />;
}
