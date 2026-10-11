import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategories, getCountries, getCurrencies } from "@/lib/api/reference";
import { ProjectWizard } from "@/modules/projects";

export async function generateMetadata({ params }: PageProps<"/[locale]/influencers/new">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("newRequest") };
}

export default async function NewInfluencerRequestPage({ params }: PageProps<"/[locale]/influencers/new">) {
  setRequestLocale((await params).locale);
  const [categories, currencies, countries] = await Promise.all([getCategories(), getCurrencies(), getCountries()]);

  return (
    <div className="page-container py-10">
      <ProjectWizard type="influencer_request" categories={categories} currencies={currencies} countries={countries} />
    </div>
  );
}
