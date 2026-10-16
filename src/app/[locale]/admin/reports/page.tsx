import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatusTabs, UserCell, dateTime, toneFor, type AdminReport, type List } from "@/modules/admin";

const STATUSES = ["open", "actioned", "dismissed"] as const;
const TARGETS = ["user", "project", "portfolio", "review"] as const;

export default async function AdminReports({ params, searchParams }: PageProps<"/[locale]/admin/reports">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "targetType"]);
  const status = filter.status ?? "open";
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.reports"),
    getLocale(),
    apiGet<List<AdminReport> & { counts: Record<string, number> }>(`/admin/reports${toQuery({ ...filter, status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/reports"
          current={status}
          keep={{ targetType: filter.targetType }}
          tabs={STATUSES.map((value) => ({ value, label: t(`status.${value}`), count: result.counts[value] }))}
        />
        <AdminSearch filters={[{ name: "targetType", label: t("allTargets"), options: TARGETS.map((value) => ({ value, label: t(`targets.${value}`) })) }]} />
        <AdminTable head={[t("item"), t("reason"), t("reporter"), t("date"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((r) => (
            <tr key={r.id}>
              <Cell className="max-w-xs">
                <div className="text-xs text-muted">{t(`targets.${r.targetType}`)}</div>
                {r.target?.path ? (
                  <Link href={r.target.path} className="font-medium hover:text-brand">
                    {r.target.title || `#${r.targetId}`}
                  </Link>
                ) : (
                  <span className="text-muted">{t("deleted")}</span>
                )}
              </Cell>
              <Cell className="max-w-sm">
                <StatusPill tone="warning">{t(`reasons.${r.reason}`)}</StatusPill>
                {r.details && <p className="mt-1.5 text-xs whitespace-pre-line text-muted">{r.details}</p>}
                {r.resolutionNote && <p className="mt-1.5 text-xs text-brand">{r.resolutionNote}</p>}
              </Cell>
              <Cell>
                <UserCell user={r.reporter} />
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(r.createdAt, locale)}</Cell>
              <Cell>
                {r.status === "open" ? (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <ActionButton
                      label={t("action")}
                      endpoint={`/admin/reports/${r.id}/resolve`}
                      tone="danger"
                      body={{ decision: "actioned" }}
                      description={t("actionHint")}
                      fields={[{ name: "note", label: t("note"), type: "textarea", hint: t("noteHint") }]}
                    />
                    <ActionButton
                      label={t("dismiss")}
                      endpoint={`/admin/reports/${r.id}/resolve`}
                      body={{ decision: "dismissed" }}
                      fields={[{ name: "note", label: t("note"), type: "textarea", hint: t("noteHint") }]}
                    />
                  </div>
                ) : (
                  <StatusPill tone={toneFor(r.status)}>{t(`status.${r.status}`)}</StatusPill>
                )}
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/reports" query={{ ...filter, status }} />
      </AdminSection>
    </>
  );
}
