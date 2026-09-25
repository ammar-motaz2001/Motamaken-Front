import { getTranslations, setRequestLocale } from "next-intl/server";
import { Invitation } from "@/modules/projects";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/invitations/[id]">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("invitation") };
}

export default async function InvitationPage({ params }: PageProps<"/[locale]/projects/invitations/[id]">) {
  setRequestLocale((await params).locale);

  return (
    <div className="page-container py-10">
      <Invitation />
    </div>
  );
}
