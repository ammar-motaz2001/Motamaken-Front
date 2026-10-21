import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, Team, TeamInvitation } from "@/lib/api/types";
import { TeamsPage } from "@/modules/teams";

/** Browser title of the teams screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/teams">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Teams" });
  return { title: `${t("title")} | Mutamakin` };
}

/** Teams: the user's teams from GET /teams and pending invitations from GET /me/team-invitations. */
export default async function Teams({ params }: PageProps<"/[locale]/teams">) {
  setRequestLocale((await params).locale);
  const [teams, invitations] = await Promise.all([
    apiGetOrNull<Paginated<Team>>("/teams?perPage=50"),
    apiGetOrNull<{ data: TeamInvitation[] }>("/me/team-invitations"),
  ]);

  return (
    <div className="page-container py-10">
      <TeamsPage teams={teams?.data ?? null} invitations={invitations?.data ?? null} />
    </div>
  );
}
