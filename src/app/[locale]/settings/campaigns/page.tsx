import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Campaign, Paginated } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { Pagination } from "@/components/ui/Pagination";
import { CampaignList } from "@/modules/campaigns";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings/campaigns">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Campaigns" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function Campaigns({ params, searchParams }: PageProps<"/[locale]/settings/campaigns">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const { status } = pickParams(query, ["status"]);
  const result = await apiGetOrNull<Paginated<Campaign>>(`/me/campaigns${toQuery({ status, page: pageParam(query) })}`);

  return (
    <>
      <CampaignList campaigns={result?.data ?? []} status={status} />
      {result && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/settings/campaigns" query={{ status }} />}
    </>
  );
}
