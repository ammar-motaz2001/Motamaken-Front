import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Dispute, Paginated } from "@/lib/api/types";
import { pageParam, toQuery } from "@/lib/params";
import { DisputeList } from "@/modules/disputes";

/** Browser title of the disputes list. */
export async function generateMetadata({ params }: PageProps<"/[locale]/disputes">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Disputes" });
  return { title: `${t("title")} | Mutamakin` };
}

/** My disputes: cases the user opened or is party to, from GET /disputes. */
export default async function DisputesPage({ params, searchParams }: PageProps<"/[locale]/disputes">) {
  setRequestLocale((await params).locale);
  const result = await apiGetOrNull<Paginated<Dispute>>(`/disputes${toQuery({ page: pageParam(await searchParams) })}`);

  return (
    <div className="page-container py-10">
      <DisputeList result={result} />
    </div>
  );
}
