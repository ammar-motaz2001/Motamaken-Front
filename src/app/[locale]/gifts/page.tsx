import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Draw, DrawHistoryItem } from "@/lib/api/types";
import { SESSION_COOKIE } from "@/lib/session";
import { pageMetadata } from "@/lib/seo";
import { GiftsPage } from "@/modules/rewards";

export async function generateMetadata({ params }: PageProps<"/[locale]/gifts">) {
  const { locale } = await params;
  const [t, seo] = await Promise.all([getTranslations({ locale, namespace: "Rewards.draw" }), getTranslations({ locale, namespace: "Seo" })]);
  return pageMetadata({ title: `${t("title")} | Mutamakin`, description: seo("gifts"), path: "/gifts", locale });
}

export default async function Gifts({ params }: PageProps<"/[locale]/gifts">) {
  setRequestLocale((await params).locale);
  const [draw, history, signedIn] = await Promise.all([
    apiGetOrNull<{ data: Draw | null }>("/draws/current"),
    apiGetOrNull<{ data: DrawHistoryItem[] }>("/draws/history?perPage=5"),
    cookies().then((store) => store.has(SESSION_COOKIE)),
  ]);

  return (
    <div className="page-container py-10">
      <GiftsPage draw={draw?.data ?? null} history={history?.data ?? []} signedIn={signedIn} />
    </div>
  );
}
