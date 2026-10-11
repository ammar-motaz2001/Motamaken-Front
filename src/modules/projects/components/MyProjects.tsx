import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { outlinedPanelClasses, panelClasses } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import type { Paginated, Project } from "@/lib/api/types";
import { formatAmount, timeAgo } from "@/lib/format";
import { PROJECT_STATUS_TONE } from "../lib/status";
import { StatusTabs } from "./StatusTabs";

const STATUSES = ["", "open", "in_progress", "completed", "closed"] as const;

export function MyProjects({ result, status }: { result: Paginated<Project> | null; status: string }) {
  const t = useTranslations("Projects");
  const locale = useLocale();

  return (
    <section className={`${panelClasses} flex flex-col gap-5`}>
      <PageHeader
        crumbs={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("mine.title") }]}
        title={t("mine.title")}
        subtitle={t("mine.subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/projects/new" variant="solid" pill>
              {t("mine.newProject")}
            </Button>
            <Button href="/influencers/new" variant="outline" pill>
              {t("mine.newRequest")}
            </Button>
          </div>
        }
      />
      <StatusTabs
        pathname="/my-projects"
        active={status}
        tabs={STATUSES.map((value) => ({ value, label: value ? t(`status.${value}`) : t("mine.all") }))}
      />
      {!result && <p className="py-10 text-center text-muted">{t("list.failed")}</p>}
      {result?.data.length === 0 && <p className="py-10 text-center text-muted">{t("mine.empty")}</p>}
      <ul className="flex flex-col gap-3">
        {result?.data.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`} className={`${outlinedPanelClasses} flex flex-wrap items-center gap-4 hover:border-brand`}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate font-bold">{project.title}</p>
                <p className="text-xs text-muted">
                  {project.category.name} · {t(`types.${project.type}`)} · <span suppressHydrationWarning>{timeAgo(project.createdAt, locale)}</span>
                </p>
              </div>
              <span className="text-sm font-medium text-brand-ink">
                {formatAmount(project.budget.min, project.budget.currency, locale)} -{" "}
                {formatAmount(project.budget.max, project.budget.currency, locale)}
              </span>
              <span className="text-sm text-muted">{t("mine.offers", { count: project.proposalsCount ?? 0 })}</span>
              <StatusPill tone={PROJECT_STATUS_TONE[project.status]}>{t(`status.${project.status}`)}</StatusPill>
            </Link>
          </li>
        ))}
      </ul>
      {result && (
        <Pagination
          page={result.meta.current_page}
          lastPage={result.meta.last_page}
          pathname="/my-projects"
          query={{ status: status || undefined }}
        />
      )}
    </section>
  );
}
