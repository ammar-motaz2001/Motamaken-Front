import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { TeamInvitation } from "@/lib/api/types";
import { InvitationCard } from "@/modules/teams";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/invitations/[id]">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Teams" });
  return { title: `${t("invitation.title")} | Motamakin` };
}

export default async function InvitationPage({ params }: PageProps<"/[locale]/projects/invitations/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Teams");
  const result = await apiGetOrNull<{ data: TeamInvitation[] }>("/me/team-invitations");
  const invitation = result?.data.find((item) => String(item.id) === id);
  if (!invitation) notFound();

  return (
    <div className="page-container mx-auto flex max-w-[680px] flex-col gap-4 py-10">
      <h1 className="text-xl font-bold">{t("invitation.title")}</h1>
      <InvitationCard invitation={invitation} />
    </div>
  );
}
