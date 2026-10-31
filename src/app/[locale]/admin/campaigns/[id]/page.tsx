import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import type { Campaign, CampaignVisit, Paginated } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader } from "@/modules/admin";
import { CampaignDetail } from "@/modules/campaigns";

type Daily = { currency: string; data: { date: string; valid: number; rejected: number; spent: number }[] };

/** Admin › Campaign: the owner's detail view, read-only, from GET /campaigns/{id} and its /daily and /visits lists. */
export default async function AdminCampaignPage({ params, searchParams }: PageProps<"/[locale]/admin/campaigns/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d+$/.test(id)) notFound();
  const query = await searchParams;
  const filter = pickParams(query, ["status", "reason"]);

  const [t, campaign, daily, visits] = await Promise.all([
    getTranslations("Admin.campaigns"),
    apiGetOrNull<{ data: Campaign }>(`/campaigns/${id}`),
    apiGetOrNull<Daily>(`/campaigns/${id}/daily?days=14`),
    apiGetOrNull<Paginated<CampaignVisit>>(`/campaigns/${id}/visits${toQuery({ ...filter, perPage: "20", page: pageParam(query) })}`),
  ]);
  if (!campaign) notFound();

  return (
    <>
      <AdminHeader
        title={t("detailTitle")}
        actions={
          <Link href="/admin/campaigns" className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
            {t("back")}
          </Link>
        }
      />
      <CampaignDetail campaign={campaign.data} daily={daily?.data ?? []} visits={visits} visitFilter={filter} readOnly />
    </>
  );
}
