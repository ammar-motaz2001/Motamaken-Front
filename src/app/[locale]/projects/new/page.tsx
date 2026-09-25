import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectWizard } from "@/modules/projects";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/new">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("new") };
}

export default async function NewProjectPage({ params }: PageProps<"/[locale]/projects/new">) {
  setRequestLocale((await params).locale);

  return (
    <div className="page-container py-10">
      <ProjectWizard />
    </div>
  );
}
