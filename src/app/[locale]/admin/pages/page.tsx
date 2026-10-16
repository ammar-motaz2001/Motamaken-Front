import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { AdminHeader, AdminSection, AdminTable, Cell, dateTime, type AdminPage } from "@/modules/admin";

export default async function AdminPages({ params }: PageProps<"/[locale]/admin/pages">) {
  setRequestLocale((await params).locale);
  const [t, locale, { data }] = await Promise.all([getTranslations("Admin.pages"), getLocale(), apiGet<{ data: AdminPage[] }>("/admin/pages")]);

  return (
    <>
      <AdminHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Link href="/admin/pages/new" className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-white">
            + {t("new")}
          </Link>
        }
      />
      {(["about", "help", "legal"] as const).map((section) => (
        <AdminSection key={section} title={t(`sections.${section}`)}>
          <AdminTable head={[t("title"), t("slug"), t("updated"), t("state"), ""]} empty={data.some((p) => p.section === section) ? false : t("empty")}>
            {data
              .filter((page) => page.section === section)
              .map((page) => (
                <tr key={page.slug}>
                  <Cell>
                    <div className="font-medium">{locale === "ar" ? page.titleAr : page.titleEn}</div>
                    <div className="text-xs text-muted">{locale === "ar" ? page.titleEn : page.titleAr}</div>
                  </Cell>
                  <Cell>
                    <Link href={`/${page.slug}`} className="text-link hover:underline" dir="ltr">
                      /{page.slug}
                    </Link>
                  </Cell>
                  <Cell className="whitespace-nowrap">{dateTime(page.updatedAt, locale)}</Cell>
                  <Cell>
                    <StatusPill tone={page.isPublished ? "success" : "muted"}>{page.isPublished ? t("published") : t("hidden")}</StatusPill>
                  </Cell>
                  <Cell className="text-end">
                    <Link href={`/admin/pages/${page.slug}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
                      {t("edit")}
                    </Link>
                  </Cell>
                </tr>
              ))}
          </AdminTable>
        </AdminSection>
      ))}
    </>
  );
}
