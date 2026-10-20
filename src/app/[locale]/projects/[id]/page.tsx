import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cache } from "react";
import type { ApiError } from "@/lib/api/errors";
import { getSummary } from "@/lib/api/reference";
import { apiGet, apiGetOrNull } from "@/lib/api/server";
import type { Escrow, Paginated, Project, Proposal, Review } from "@/lib/api/types";
import { describe, pageMetadata } from "@/lib/seo";
import { ProjectView } from "@/modules/projects";

const loadProject = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();
  return apiGet<{ data: Project }>(`/projects/${id}`)
    .then((result) => result.data)
    .catch((error: ApiError) => {
      if (error.status === 404 || error.status === 403) notFound();
      throw error;
    });
});

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[id]">) {
  const { locale, id } = await params;
  const project = await loadProject(id);
  return pageMetadata({ title: `${project.title} | Mutamakin`, description: describe(project.description), path: `/projects/${project.id}`, locale, type: "article" });
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [project, summary] = await Promise.all([loadProject(id), getSummary()]);
  const viewerId = summary?.user.id ?? null;
  const proposals =
    viewerId === project.owner.id
      ? ((await apiGetOrNull<Paginated<Proposal>>(`/projects/${id}/proposals?perPage=50`))?.data ?? [])
      : null;
  const hired = project.status === "in_progress" || project.status === "completed";
  const reviews = project.status === "completed" ? await apiGetOrNull<{ data: Review[]; canReview: boolean }>(`/projects/${id}/reviews`) : null;
  const escrow = viewerId && hired ? ((await apiGetOrNull<{ data: Escrow }>(`/projects/${id}/escrow`))?.data ?? null) : null;

  const t = await getTranslations("Projects.mine");
  const isOwner = viewerId === project.owner.id;

  return (
    <div className="page-container flex flex-col gap-4 py-10">
      {isOwner && project.isHidden && <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{t("hidden", { reason: project.hiddenReason ?? "" })}</p>}
      {isOwner && project.status === "draft" && <p className="rounded-lg bg-orange/10 px-4 py-3 text-sm text-orange">{t("draftNote")}</p>}
      <ProjectView project={project} viewerId={viewerId} proposals={proposals} escrow={escrow} reviews={reviews} />
    </div>
  );
}
