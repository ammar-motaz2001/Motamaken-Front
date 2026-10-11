import { forbidden, notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import type { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import type { Dispute } from "@/lib/api/types";
import { DisputeCase } from "@/modules/disputes";

export async function generateMetadata({ params }: PageProps<"/[locale]/disputes/[id]">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Disputes.case" });
  return { title: `${t("title")} | Motamakin` };
}

export default async function DisputePage({ params }: PageProps<"/[locale]/disputes/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d+$/.test(id)) notFound();
  const [result, summary] = await Promise.all([
    apiGet<{ data: Dispute }>(`/disputes/${id}`).catch((error: ApiError) => {
      if (error.status === 403) forbidden();
      if (error.status === 404) notFound();
      throw error;
    }),
    getSummary(),
  ]);
  if (!summary) notFound();

  return (
    <div className="page-container py-10">
      <DisputeCase dispute={result.data} viewerId={summary.user.id} />
    </div>
  );
}
