import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminSection, type SiteConfig } from "@/modules/admin";
import { SiteConfigForm } from "@/modules/admin/components/SiteConfigForm";
import { adminGet } from "@/modules/admin/server";

/** Admin › Site settings: site details, social and app links and maintenance mode, from GET /admin/site-settings. */
export default async function AdminSiteSettings({ params }: PageProps<"/[locale]/admin/site-settings">) {
  setRequestLocale((await params).locale);
  const [t, { data }] = await Promise.all([getTranslations("Admin.siteSettings"), adminGet<{ data: SiteConfig }>("/admin/site-settings")]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      {data.maintenance.enabled && <p className="rounded-lg border border-orange bg-orange/10 px-4 py-3 text-sm font-medium text-orange">{t("maintenanceActive")}</p>}
      <AdminSection>
        <SiteConfigForm config={data} />
      </AdminSection>
    </>
  );
}
