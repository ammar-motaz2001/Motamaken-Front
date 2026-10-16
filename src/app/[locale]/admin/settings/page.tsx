import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGet } from "@/lib/api/server";
import { AdminHeader, AdminSection, SettingsForm, type SiteSettings } from "@/modules/admin";

export default async function AdminSettings({ params }: PageProps<"/[locale]/admin/settings">) {
  setRequestLocale((await params).locale);
  const [t, { data }] = await Promise.all([getTranslations("Admin.settings"), apiGet<{ data: SiteSettings }>("/admin/settings")]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <SettingsForm settings={data} />
      </AdminSection>
    </>
  );
}
