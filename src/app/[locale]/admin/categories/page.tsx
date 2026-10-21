import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGet } from "@/lib/api/server";
import { AdminHeader, AdminSection, CategoryEditor, type AdminCategory } from "@/modules/admin";

/** Admin › Categories: add, edit and order project and influencer categories, from GET /admin/categories. */
export default async function AdminCategories({ params }: PageProps<"/[locale]/admin/categories">) {
  setRequestLocale((await params).locale);
  const [t, { data }] = await Promise.all([getTranslations("Admin.categories"), apiGet<{ data: AdminCategory[] }>("/admin/categories")]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <CategoryEditor categories={data} />
      </AdminSection>
    </>
  );
}
