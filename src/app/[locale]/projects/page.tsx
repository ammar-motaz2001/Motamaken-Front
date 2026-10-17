import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { panelClasses } from "@/components/ui/styles";
import { getCategories, getCountries } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, Project } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";
import { FILTER_KEYS, ProjectFilters, ProjectGrid } from "@/modules/projects";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  const [t, seo] = await Promise.all([getTranslations({ locale, namespace: "Projects.metadata" }), getTranslations({ locale, namespace: "Seo" })]);
  return pageMetadata({ title: t("browse"), description: seo("projects"), path: "/projects", locale });
}

export default async function ProjectsPage({ params, searchParams }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const query = await searchParams;
  const filters = pickParams(query, FILTER_KEYS);
  const page = pageParam(query);

  const [result, categories, countries] = await Promise.all([
    apiGetOrNull<Paginated<Project>>(`/projects${toQuery({ ...filters, page, perPage: "20" })}`),
    getCategories(),
    getCountries(),
  ]);

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <section className={`${panelClasses} flex flex-col gap-5`}>
        <PageHeader
          crumbs={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("breadcrumb.projects") }]}
          title={t("list.title")}
          subtitle={t("list.subtitle")}
        />
        <ProjectFilters key={toQuery(filters)} filters={filters} categories={categories} countries={countries} />
        <ProjectGrid result={result} pathname="/projects" query={filters} />
      </section>
    </div>
  );
}
