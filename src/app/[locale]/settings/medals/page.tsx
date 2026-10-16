import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Medal } from "@/lib/api/types";
import { MedalsPage } from "@/modules/rewards";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings/medals">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Rewards.medals" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function Medals({ params }: PageProps<"/[locale]/settings/medals">) {
  setRequestLocale((await params).locale);
  const result = await apiGetOrNull<{ data: Medal[] }>("/me/medals");
  return result ? <MedalsPage medals={result.data} /> : null;
}
