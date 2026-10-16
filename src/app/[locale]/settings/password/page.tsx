import { getTranslations, setRequestLocale } from "next-intl/server";
import { PasswordSettings } from "@/modules/settings";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings/password">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Settings.password" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function PasswordSettingsPage({ params }: PageProps<"/[locale]/settings/password">) {
  setRequestLocale((await params).locale);
  return <PasswordSettings />;
}
