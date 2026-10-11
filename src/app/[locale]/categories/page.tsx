import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { panelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/api/reference";
import type { CategoryType } from "@/lib/api/types";

const GROUPS: CategoryType[] = ["project", "influencer"];

export async function generateMetadata({ params }: PageProps<"/[locale]/categories">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("categories") };
}

export default async function CategoriesPage({ params }: PageProps<"/[locale]/categories">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("Projects");
  const categories = await getCategories();

  return (
    <div className="page-container py-10">
      <section className={`${panelClasses} flex flex-col gap-6`}>
        <PageHeader
          crumbs={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("categoriesPage.title") }]}
          title={t("categoriesPage.title")}
          subtitle={t("categoriesPage.subtitle")}
        />
        {!categories.length && <p className="py-10 text-center text-muted">{t("list.failed")}</p>}
        {GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-3">
            <h2 className={sectionTitleClasses}>{t(`categoriesPage.${group}`)}</h2>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories
                .filter((category) => category.type === group)
                .map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="flex h-full flex-col items-center gap-2 rounded-lg border border-border px-3 py-5 text-center hover:border-brand"
                    >
                      <CategoryIcon icon={category.icon} className="size-8 text-brand" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
