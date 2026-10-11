import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import { NotificationSettings } from "@/modules/settings";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings/notifications">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Settings.notifications" });
  return { title: `${t("title")} | Motamakin` };
}

export default async function NotificationSettingsPage({ params }: PageProps<"/[locale]/settings/notifications">) {
  setRequestLocale((await params).locale);
  const [settings, summary] = await Promise.all([
    apiGetOrNull<{ data: Record<string, boolean>; required: string[] }>("/me/notification-settings"),
    getSummary(),
  ]);
  return settings ? <NotificationSettings initial={settings} email={summary?.user.email ?? null} /> : null;
}
