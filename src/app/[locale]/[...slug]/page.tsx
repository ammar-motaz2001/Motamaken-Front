import { getTranslations, setRequestLocale } from "next-intl/server";
import { UnderConstruction } from "@/components/under-construction/UnderConstruction";

export async function generateMetadata({ params }: PageProps<"/[locale]/[...slug]">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("underConstruction") };
}

export default async function UnderConstructionPage({ params }: PageProps<"/[locale]/[...slug]">) {
  setRequestLocale((await params).locale);
  return <UnderConstruction />;
}
