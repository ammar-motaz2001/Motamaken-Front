import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/types";
import { PremiumPage } from "@/modules/promotions";

type Row = Parameters<typeof PremiumPage>[0]["promotions"][number];

export async function generateMetadata({ params }: PageProps<"/[locale]/premium">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Promotions.premium" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function Premium({ params }: PageProps<"/[locale]/premium">) {
  setRequestLocale((await params).locale);
  const summary = await getSummary();
  const promotions = summary ? await apiGetOrNull<Paginated<Row>>("/me/promotions?perPage=20") : null;

  return (
    <div className="page-container py-10">
      <PremiumPage user={summary?.user ?? null} currency={summary?.wallet.currency ?? "USD"} promotions={promotions?.data ?? []} />
    </div>
  );
}
