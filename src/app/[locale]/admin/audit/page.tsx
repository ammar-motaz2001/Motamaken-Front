import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, UserCell, dateTime, type AuditRow, type List, type StaffMember } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

/** Where a logged record lives in the panel. */
const SUBJECT_PATHS: Record<string, string> = {
  users: "/admin/users", projects: "/admin/projects", disputes: "/admin/disputes", kyc: "/admin/kyc", teams: "/admin/teams", escrows: "/admin/escrows", support: "/admin/support",
};

/** Admin › Audit: every staff action, filterable by staff member and action, from GET /admin/audit. */
export default async function AdminAudit({ params, searchParams }: PageProps<"/[locale]/admin/audit">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["adminId", "action", "subjectType", "subjectId", "from", "to"]);
  const [t, locale, staff, result] = await Promise.all([
    getTranslations("Admin.audit"),
    getLocale(),
    adminGet<{ data: StaffMember[] }>("/admin/staff"),
    adminGet<List<AuditRow> & { actions: string[] }>(`/admin/audit${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);
  const areas = [...new Set(result.actions.map((action) => action.split(".")[0]))];

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="audit" query={filter} />} />
      <AdminSection>
        <AdminSearch
          dates
          filters={[
            { name: "adminId", label: t("anyone"), options: staff.data.map((m) => ({ value: String(m.id), label: m.fullName })) },
            { name: "action", label: t("anyAction"), options: [...areas.map((a) => ({ value: a, label: `${a}.*` })), ...result.actions.map((a) => ({ value: a, label: a }))] },
          ]}
        />
        <AdminTable head={[t("when"), t("who"), t("action"), t("record"), t("details")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((row) => {
            const base = row.subjectType ? SUBJECT_PATHS[row.subjectType] : undefined;
            const changes = row.changes as { input?: unknown; before?: unknown; key?: string } | null;
            return (
              <tr key={row.id}>
                <Cell className="text-xs whitespace-nowrap">
                  {dateTime(row.createdAt, locale)}
                  <div className="text-muted" dir="ltr">{row.ip}</div>
                </Cell>
                <Cell>
                  <UserCell user={row.admin} />
                </Cell>
                <Cell className="font-mono text-xs">{row.action}</Cell>
                <Cell className="text-xs">
                  {base && row.subjectId ? (
                    <Link href={`${base}/${row.subjectId}`} className="text-link hover:underline">
                      {row.subjectType} #{row.subjectId}
                    </Link>
                  ) : (
                    <span>{changes?.key ?? row.subjectType ?? "—"}</span>
                  )}
                </Cell>
                <Cell className="max-w-md text-xs">
                  {changes?.input != null && <pre className="overflow-x-auto rounded bg-surface-muted p-2 whitespace-pre-wrap">{JSON.stringify(changes.input, null, 1)}</pre>}
                  {changes?.before != null && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-muted">{t("before")}</summary>
                      <pre className="overflow-x-auto rounded bg-surface-muted p-2 whitespace-pre-wrap">{JSON.stringify(changes.before, null, 1)}</pre>
                    </details>
                  )}
                </Cell>
              </tr>
            );
          })}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/audit" query={filter} />
      </AdminSection>
    </>
  );
}
