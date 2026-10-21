import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Escrow, Paginated } from "@/lib/api/types";
import { pageParam, toQuery } from "@/lib/params";
import { EscrowList } from "@/modules/escrow";

/** Browser title of the escrow screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/escrow">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Escrow.overview" });
  return { title: `${t("title")} | Mutamakin` };
}

/** Settings › Escrow: the user's held payments, as payer or payee, from GET /me/escrows. */
export default async function EscrowPage({ params, searchParams }: PageProps<"/[locale]/settings/escrow">) {
  setRequestLocale((await params).locale);
  const [summary, result] = await Promise.all([
    getSummary(),
    apiGetOrNull<Paginated<Escrow>>(`/me/escrows${toQuery({ page: pageParam(await searchParams) })}`),
  ]);

  return <EscrowList result={result} viewerId={summary?.user.id ?? null} />;
}
