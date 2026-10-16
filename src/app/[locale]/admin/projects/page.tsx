import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatusTabs, UserCell, date, money, toneFor, type AdminProject, type List } from "@/modules/admin";

const STATUSES = ["open", "in_progress", "completed", "closed"] as const;

export default async function AdminProjects({ params, searchParams }: PageProps<"/[locale]/admin/projects">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["q", "status", "type"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.projects"),
    getLocale(),
    apiGet<List<AdminProject>>(`/admin/projects${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle", { count: result.meta.total })} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/projects"
          current={filter.status}
          keep={{ q: filter.q, type: filter.type }}
          tabs={[{ value: undefined, label: t("all") }, ...STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))]}
        />
        <AdminSearch
          placeholder={t("search")}
          filters={[{ name: "type", label: t("allTypes"), options: [{ value: "project", label: t("type.project") }, { value: "influencer_request", label: t("type.influencer_request") }] }]}
        />
        <AdminTable head={[t("project"), t("owner"), t("budget"), t("offers"), t("created"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((project) => (
            <tr key={project.id}>
              <Cell className="max-w-xs min-w-56">
                <Link href={`/projects/${project.id}`} className="font-medium hover:text-brand">
                  {project.title}
                </Link>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-muted">
                  <span>{t(`type.${project.type}`)}</span>
                  {project.category && <span>· {project.category.name}</span>}
                  {project.isFeatured && <span className="text-orange">· {t("featured")}</span>}
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
                  {project.status === "open" &&
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
                  {project.status === "open" && (
                    <ActionButton label={t("close")} endpoint={`/admin/projects/${project.id}/close`} tone="danger" confirm={t("confirmClose", { title: project.title })} />
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
