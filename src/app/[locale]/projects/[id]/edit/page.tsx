import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCategories, getCountries, getCurrencies, getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Project } from "@/lib/api/types";
import { formFromProject, ProjectWizard } from "@/modules/projects";

/** Edit project: the wizard prefilled from GET /projects/{id}; only the owner of a still-open project may use it. */
export default async function EditProjectPage({ params }: PageProps<"/[locale]/projects/[id]/edit">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d+$/.test(id)) notFound();

  const [result, summary, categories, currencies, countries] = await Promise.all([
    apiGetOrNull<{ data: Project }>(`/projects/${id}`),
    getSummary(),
    getCategories(),
    getCurrencies(),
    getCountries(),
  ]);
  const project = result?.data;
  if (!project) notFound();
  if (project.owner.id !== summary?.user.id || project.status !== "open") redirect({ href: `/projects/${id}`, locale });

  const countryId = String(countries.find((country) => country.name === project.country)?.id ?? "");

  return (
    <div className="page-container py-10">
      <ProjectWizard
        type={project.type}
        categories={categories}
        currencies={currencies}
        countries={countries}
        project={project}
        initial={formFromProject(project, countryId, "")}
        initialCityName={project.city}
      />
    </div>
  );
}
