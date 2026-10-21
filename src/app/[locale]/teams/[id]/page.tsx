import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Team } from "@/lib/api/types";
import { TeamDetail } from "@/modules/teams";

/** One team with its members and roles, from GET /teams/{id}. */
export default async function TeamPage({ params }: PageProps<"/[locale]/teams/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d+$/.test(id)) notFound();
  const result = await apiGetOrNull<{ data: Team }>(`/teams/${id}`);
  if (!result) notFound();

  return (
    <div className="page-container py-10">
      <TeamDetail team={result.data} />
    </div>
  );
}
