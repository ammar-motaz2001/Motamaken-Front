import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import { pageParam, toQuery } from "@/lib/params";
import { MyReports } from "@/modules/reports";

/** Browser title of the my-reports screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/reports">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Reports" });
  return { title: t("title") };
}

/** Settings › Reports: content the user has reported and the outcome, from GET /me/reports. */
export default async function ReportsPage({ params, searchParams }: PageProps<"/[locale]/settings/reports">) {
  setRequestLocale((await params).locale);
  const result = await apiGetOrNull<Parameters<typeof MyReports>[0]["result"]>(`/me/reports${toQuery({ page: pageParam(await searchParams) })}`);
  return <MyReports result={result} />;
}
