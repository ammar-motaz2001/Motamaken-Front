import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, Proposal } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { MyOffers } from "@/modules/projects";

export async function generateMetadata({ params }: PageProps<"/[locale]/offers">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("offers") };
}

export default async function MyOffersPage({ params, searchParams }: PageProps<"/[locale]/offers">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const { status } = pickParams(query, ["status"]);
  const result = await apiGetOrNull<Paginated<Proposal>>(`/me/proposals${toQuery({ status, page: pageParam(query) })}`);

  return (
    <div className="page-container py-10">
      <MyOffers result={result} status={status ?? ""} />
    </div>
  );
}
