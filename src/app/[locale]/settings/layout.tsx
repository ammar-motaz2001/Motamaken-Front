import { getTranslations } from "next-intl/server";
import { SettingsNav } from "@/modules/settings";

export default async function SettingsLayout({ children }: LayoutProps<"/[locale]/settings">) {
  const t = await getTranslations("Settings");

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <h1 className="text-2xl font-bold text-orange uppercase">{t("title")}</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
