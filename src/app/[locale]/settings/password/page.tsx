import { getTranslations, setRequestLocale } from "next-intl/server";
import { PasswordSettings } from "@/modules/settings";

/** Browser title of the change-password screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/password">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Settings.password" });
  return { title: `${t("title")} | Mutamakin` };
}

/** Settings › Password: change the account password (the form posts to the API itself). */
export default async function PasswordSettingsPage({ params }: PageProps<"/[locale]/settings/password">) {
  setRequestLocale((await params).locale);
  return <PasswordSettings />;
}
