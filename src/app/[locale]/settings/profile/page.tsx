import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { ProfileSettings } from "@/modules/settings";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings/profile">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Settings.profile" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function ProfileSettingsPage({ params }: PageProps<"/[locale]/settings/profile">) {
  setRequestLocale((await params).locale);
  const summary = await getSummary();
  return summary ? <ProfileSettings user={summary.user} /> : null;
}
