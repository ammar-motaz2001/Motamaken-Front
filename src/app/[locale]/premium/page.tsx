import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/types";
import { pageMetadata } from "@/lib/seo";
import { PremiumPage } from "@/modules/promotions";

type Row = Parameters<typeof PremiumPage>[0]["promotions"][number];

/** Search-engine title and description of the premium page. */
export async function generateMetadata({ params }: PageProps<"/[locale]/premium">) {
  const { locale } = await params;
  const [t, seo] = await Promise.all([getTranslations({ locale, namespace: "Promotions.premium" }), getTranslations({ locale, namespace: "Seo" })]);
  return pageMetadata({ title: `${t("title")} | Mutamakin`, description: seo("premium"), path: "/premium", locale });
}

/** Premium: promotion packages to buy; signed-in users also see their current promotions from GET /me/promotions. */
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
