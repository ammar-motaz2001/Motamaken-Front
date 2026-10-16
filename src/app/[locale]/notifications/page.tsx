import { getTranslations, setRequestLocale } from "next-intl/server";
import { NotificationsPage } from "@/modules/notifications";

export async function generateMetadata({ params }: PageProps<"/[locale]/notifications">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Notifications" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function Notifications({ params }: PageProps<"/[locale]/notifications">) {
  setRequestLocale((await params).locale);
  return (
    <div className="page-container py-10">
      <NotificationsPage />
    </div>
  );
}
