import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategories, getCountries, getCurrencies } from "@/lib/api/reference";
import { ProjectWizard } from "@/modules/projects";

/** Browser title of the post-a-project screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/projects/new">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("new") };
}

/** Post a project: the project wizard with categories, currencies and countries from the reference data. */
export default async function NewProjectPage({ params }: PageProps<"/[locale]/projects/new">) {
  setRequestLocale((await params).locale);
  const [categories, currencies, countries] = await Promise.all([getCategories(), getCurrencies(), getCountries()]);

  return (
    <div className="page-container py-10">
      <ProjectWizard type="project" categories={categories} currencies={currencies} countries={countries} />
    </div>
  );
}
