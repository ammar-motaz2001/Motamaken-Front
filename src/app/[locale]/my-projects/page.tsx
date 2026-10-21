import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, Project } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { MyProjects } from "@/modules/projects";

/** Browser title of the my-projects screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/my-projects">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("mine") };
}

/** My projects: projects the user posted, filterable by status, from GET /me/projects. */
export default async function MyProjectsPage({ params, searchParams }: PageProps<"/[locale]/my-projects">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const { status } = pickParams(query, ["status"]);
  const result = await apiGetOrNull<Paginated<Project>>(`/me/projects${toQuery({ status, page: pageParam(query) })}`);

  return (
    <div className="page-container py-10">
      <MyProjects result={result} status={status ?? ""} />
    </div>
  );
}
