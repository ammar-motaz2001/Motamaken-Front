import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { panelClasses } from "@/components/ui/styles";
import { getCategories, getCountries } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, Project } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";
import { FILTER_KEYS, ProjectFilters, ProjectGrid } from "@/modules/projects";

/** Category with the given slug from the reference data; 404 when there is none. */
async function findCategory(slug: string) {
  const category = (await getCategories()).find((item) => item.slug === slug);
  if (!category) notFound();
  return category;
}

/** Search-engine title and description of one category. */
export async function generateMetadata({ params }: PageProps<"/[locale]/categories/[slug]">) {
  const { locale, slug } = await params;
  const [category, t] = await Promise.all([findCategory(slug), getTranslations({ locale, namespace: "Seo" })]);
  return pageMetadata({ title: category.name, description: t("category", { name: category.name }), path: `/categories/${category.slug}`, locale });
}

/** One category: its open projects or influencer requests from GET /projects with the usual filters; 404 for unknown slugs. */
export default async function CategoryPage({ params, searchParams }: PageProps<"/[locale]/categories/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const category = await findCategory(slug);
  const query = await searchParams;
  const filters = pickParams(query, FILTER_KEYS.filter((key) => key !== "category" && key !== "type"));
  const type = category.type === "project" ? "project" : "influencer_request";

  const [result, categories, countries] = await Promise.all([
    apiGetOrNull<Paginated<Project>>(
      `/projects${toQuery({ ...filters, type, category: slug, page: pageParam(query), perPage: "20" })}`,
    ),
    getCategories(),
    getCountries(),
  ]);

  return (
    <div className="page-container py-10">
      <section className={`${panelClasses} flex flex-col gap-5`}>
        <PageHeader
          crumbs={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("categoriesPage.title"), href: "/categories" },
            { label: category.name },
          ]}
          title={category.name}
          subtitle={t(`categoriesPage.${category.type}`)}
          actions={<CategoryIcon icon={category.icon} className="size-10 text-brand" />}
        />
        <ProjectFilters key={toQuery(filters)} filters={filters} categories={categories} countries={countries} lockCategory />
        <ProjectGrid result={result} pathname={`/categories/${slug}`} query={filters} />
      </section>
    </div>
  );
}
