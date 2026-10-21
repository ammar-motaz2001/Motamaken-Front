import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { Pagination } from "@/components/ui/Pagination";
import type { Paginated, Project } from "@/lib/api/types";

type ProjectGridProps = {
  result: Paginated<Project> | null;
  pathname: string;
  query: Record<string, string | undefined>;
};

/** Grid of project cards with the total count and paging; separate messages for a failed load and an empty list. */
export function ProjectGrid({ result, pathname, query }: ProjectGridProps) {
  const t = useTranslations("Projects.list");

  if (!result) return <p className="py-16 text-center text-muted">{t("failed")}</p>;
  if (!result.data.length) return <p className="py-16 text-center text-muted">{t("empty")}</p>;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("count", { count: result.meta.total })}</p>
      <div className="card-grid grid grid-cols-[repeat(auto-fill,minmax(212px,1fr))] justify-center gap-5 sm:justify-start">
        {result.data.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname={pathname} query={query} />
    </div>
  );
}
