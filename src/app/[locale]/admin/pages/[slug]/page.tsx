import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import { AdminHeader, AdminSection, PageEditor, type AdminPage } from "@/modules/admin";

export default async function AdminPageEdit({ params }: PageProps<"/[locale]/admin/pages/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isNew = slug === "new";
  const [t, list, page] = await Promise.all([
    getTranslations("Admin.pages"),
    apiGet<{ data: AdminPage[]; placeholders: string[] }>("/admin/pages"),
    isNew
      ? null
      : apiGet<{ data: AdminPage }>(`/admin/pages/${encodeURIComponent(slug)}`).catch((error: ApiError) => {
          if (error.status === 404) notFound();
          throw error;
        }),
  ]);

  return (
    <>
      <AdminHeader
        title={isNew ? t("new") : page!.data.titleEn}
        subtitle={isNew ? t("newHint") : `/${page!.data.slug}`}
        actions={
          <>
            {!isNew && (
              <Link href={`/${page!.data.slug}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
                {t("view")}
              </Link>
            )}
            <Link href="/admin/pages" className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
              {t("back")}
            </Link>
          </>
        }
      />
      <AdminSection>
        <PageEditor page={page?.data ?? null} placeholders={list.placeholders} />
      </AdminSection>
    </>
  );
}
