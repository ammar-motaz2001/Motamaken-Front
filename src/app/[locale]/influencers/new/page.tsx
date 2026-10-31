import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategories, getCountries, getCurrencies } from "@/lib/api/reference";
import { ProjectWizard } from "@/modules/projects";

/** Browser title of the post-an-influencer-request screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/influencers/new">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  const d = await getTranslations({ locale: (await params).locale, namespace: "Metadata.descriptions" });
  return { title: t("newRequest"), description: d("newRequest") };
}

/** Post an influencer request: the project wizard in influencer mode, with categories, currencies and countries. */
export default async function NewInfluencerRequestPage({ params }: PageProps<"/[locale]/influencers/new">) {
  setRequestLocale((await params).locale);
  const [categories, currencies, countries] = await Promise.all([getCategories(), getCurrencies(), getCountries()]);

  return (
    <div className="page-container py-10">
      <ProjectWizard type="influencer_request" categories={categories} currencies={currencies} countries={countries} />
    </div>
  );
}
