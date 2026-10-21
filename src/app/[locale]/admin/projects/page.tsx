import { EyeOff } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/api/reference";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, StatusTabs, UserCell, date, money, toneFor, type AdminProject, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const STATUSES = ["draft", "open", "in_progress", "completed", "closed"] as const;

/** Admin › Projects: every project with filters and feature/hide/reactivate actions, from GET /admin/projects. */
export default async function AdminProjects({ params, searchParams }: PageProps<"/[locale]/admin/projects">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["q", "status", "type", "userId", "categoryId", "hidden"]);
  const [t, locale, categories, result] = await Promise.all([
    getTranslations("Admin.projects"),
    getLocale(),
    getCategories(),
    adminGet<List<AdminProject & { isHidden?: boolean }>>(`/admin/projects${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle", { count: result.meta.total })} actions={<ExportLink dataset="projects" query={filter} />} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/projects"
          current={filter.hidden ? "hidden" : filter.status}
          keep={{ q: filter.q, type: filter.type, userId: filter.userId, categoryId: filter.categoryId }}
          tabs={[
            { value: undefined, label: t("all") },
            ...STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
          ]}
        />
        <AdminSearch
          placeholder={t("search")}
          filters={[
            { name: "type", label: t("allTypes"), options: [{ value: "project", label: t("type.project") }, { value: "influencer_request", label: t("type.influencer_request") }] },
            { name: "categoryId", label: t("allCategories"), options: categories.map((c) => ({ value: String(c.id), label: c.name })) },
            { name: "hidden", label: t("visibility"), options: [{ value: "1", label: t("hiddenOnly") }] },
          ]}
        />
        {filter.userId && (
          <p className="text-sm">
            {t("ownerFilter", { id: filter.userId })}{" "}
            <Link href="/admin/projects" className="text-link hover:underline">
              {t("clear")}
            </Link>
          </p>
        )}
        <AdminTable head={[t("project"), t("owner"), t("budget"), t("offers"), t("created"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((project) => (
            <tr key={project.id}>
              <Cell className="max-w-xs min-w-56">
                <Link href={`/admin/projects/${project.id}`} className="font-medium hover:text-brand">
                  {project.title}
                </Link>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-muted">
                  <span>{t(`type.${project.type}`)}</span>
                  {project.category && <span>· {project.category.name}</span>}
                  {project.isFeatured && <span className="text-orange">· {t("featured")}</span>}
                  {project.isHidden && (
                    <span className="flex items-center gap-1 text-danger">
                      · <EyeOff className="size-3" /> {t("hidden")}
                    </span>
                  )}
                </div>
              </Cell>
              <Cell>
                <UserCell user={project.owner} />
              </Cell>
              <Cell className="whitespace-nowrap">
                {money(project.budget.min, project.budget.currency, locale)} – {money(project.budget.max, project.budget.currency, locale)}
              </Cell>
              <Cell>{project.proposalsCount ?? 0}</Cell>
              <Cell className="whitespace-nowrap">{date(project.createdAt, locale)}</Cell>
              <Cell>
                <StatusPill tone={toneFor(project.status)}>{t(`status.${project.status}`)}</StatusPill>
              </Cell>
              <Cell>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {project.status === "open" && !project.isHidden &&
                    (project.isFeatured ? (
                      <ActionButton label={t("unfeature")} endpoint={`/admin/projects/${project.id}/unfeature`} confirm={t("confirmUnfeature")} />
                    ) : (
                      <ActionButton
                        label={t("feature")}
                        endpoint={`/admin/projects/${project.id}/feature`}
                        tone="orange"
                        fields={[{ name: "days", label: t("days"), type: "number", required: true, defaultValue: "7" }]}
                      />
                    ))}
                  {project.isHidden ? (
                    <ActionButton label={t("reactivate")} tone="brand" endpoint={`/admin/projects/${project.id}/reactivate`} confirm={t("confirmReactivate")} />
                  ) : (
                    <ActionButton label={t("hide")} tone="danger" endpoint={`/admin/projects/${project.id}/hide`} description={t("hideHint")} fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true }]} />
                  )}
                </div>
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/projects" query={filter} />
      </AdminSection>
    </>
  );
}
