import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Draw, PointsSummary } from "@/lib/api/types";
import { pageParam, toQuery } from "@/lib/params";
import { PointsPage } from "@/modules/rewards";

/** Browser title of the points screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/points">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Rewards.points" });
  return { title: t("title") };
}

/** Settings › Points: balance and history from GET /me/points, with the current prize draw from GET /draws/current. */
export default async function Points({ params, searchParams }: PageProps<"/[locale]/settings/points">) {
  setRequestLocale((await params).locale);
  const [summary, draw] = await Promise.all([
    apiGetOrNull<PointsSummary>(`/me/points${toQuery({ page: pageParam(await searchParams) })}`),
    apiGetOrNull<{ data: Draw | null }>("/draws/current"),
  ]);
  return summary ? <PointsPage summary={summary} draw={draw?.data ?? null} /> : null;
}
