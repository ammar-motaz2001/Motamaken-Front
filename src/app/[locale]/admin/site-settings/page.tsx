import { getTranslations, setRequestLocale } from "next-intl/server";
import { FOOTER_COLUMNS } from "@/components/footer/Footer";
import type { FooterColumn } from "@/lib/api/types";
import { AdminHeader, AdminSection, type SiteConfig } from "@/modules/admin";
import { SiteConfigForm } from "@/modules/admin/components/SiteConfigForm";
import { adminGet } from "@/modules/admin/server";

/** The footer's built-in link columns in both languages, the starting point for the admins' own. */
async function defaultFooter(): Promise<FooterColumn[]> {
  const [en, ar] = await Promise.all([getTranslations({ locale: "en", namespace: "Footer" }), getTranslations({ locale: "ar", namespace: "Footer" })]);
  return FOOTER_COLUMNS.map((column) => ({
    titleEn: en(column.title),
    titleAr: ar(column.title),
    links: column.links.map((link) => ({ labelEn: en(`links.${link.key}`), labelAr: ar(`links.${link.key}`), href: link.href })),
  }));
}

/** Admin › Site settings: site details, social, footer and app links and maintenance mode, from GET /admin/site-settings. */
export default async function AdminSiteSettings({ params }: PageProps<"/[locale]/admin/site-settings">) {
  setRequestLocale((await params).locale);
  const [t, { data }, footer] = await Promise.all([getTranslations("Admin.siteSettings"), adminGet<{ data: SiteConfig }>("/admin/site-settings"), defaultFooter()]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      {data.maintenance.enabled && <p className="rounded-lg border border-orange bg-orange/10 px-4 py-3 text-sm font-medium text-orange">{t("maintenanceActive")}</p>}
      <AdminSection>
        <SiteConfigForm config={data} defaultFooter={footer} />
      </AdminSection>
    </>
  );
}
