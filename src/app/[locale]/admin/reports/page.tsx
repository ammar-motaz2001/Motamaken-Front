import { Bot } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, StatusTabs, UserCell, dateTime, toneFor, type AdminReport, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const STATUSES = ["open", "actioned", "dismissed"] as const;
const TARGETS = ["user", "project", "portfolio", "review", "message", "proposal", "team"] as const;
const PRIORITIES = ["high", "normal", "low"] as const;

/** What a moderator can do on each kind of reported item. */
const ACTIONS: Record<(typeof TARGETS)[number], string[]> = {
  user: ["none", "warned", "suspended"],
  project: ["none", "warned", "hidden", "closed", "suspended"],
  portfolio: ["none", "warned", "removed", "suspended"],
  review: ["none", "hidden", "suspended"],
  message: ["none", "warned", "removed", "suspended"],
  proposal: ["none", "warned", "removed", "suspended"],
  team: ["none", "warned", "suspended"],
};

export default async function AdminReports({ params, searchParams }: PageProps<"/[locale]/admin/reports">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "targetType", "priority", "source"]);
  const status = filter.status ?? "open";
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.reports"),
    getLocale(),
    adminGet<List<AdminReport> & { counts: Record<string, number> }>(`/admin/reports${toQuery({ ...filter, status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="reports" query={{ ...filter, status }} />} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/reports"
          current={status}
          keep={{ targetType: filter.targetType, priority: filter.priority, source: filter.source }}
          tabs={STATUSES.map((value) => ({ value, label: t(`status.${value}`), count: result.counts[value] }))}
        />
        <AdminSearch
          filters={[
            { name: "targetType", label: t("allTargets"), options: TARGETS.map((value) => ({ value, label: t(`targets.${value}`) })) },
            { name: "priority", label: t("anyPriority"), options: PRIORITIES.map((value) => ({ value, label: t(`priorities.${value}`) })) },
            { name: "source", label: t("anySource"), options: [{ value: "user", label: t("sources.user") }, { value: "ai", label: t("sources.ai") }] },
          ]}
        />
        <AdminTable head={[t("item"), t("reason"), t("priority"), t("reporter"), t("date"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((r) => (
            <tr key={r.id}>
              <Cell className="max-w-xs">
                <div className="text-xs text-muted">{t(`targets.${r.targetType}`)}</div>
                {r.target ? (
                  r.target.path ? (
                    <Link href={r.target.path} className="font-medium break-words hover:text-brand">
                      {r.target.title || `#${r.targetId}`}
                    </Link>
                  ) : (
                    <span className="font-medium break-words">{r.target.title}</span>
                  )
                ) : (
                  <span className="text-muted">{t("deleted")}</span>
                )}
                {r.target?.context && <div className="text-xs text-muted">{r.targetType === "message" ? t("sentBy", { name: r.target.context }) : r.target.context}</div>}
              </Cell>
              <Cell className="max-w-sm">
                <StatusPill tone="warning">{t(`reasons.${r.reason}`)}</StatusPill>
                {r.details && <p className="mt-1.5 text-xs whitespace-pre-line text-muted">{r.details}</p>}
                {r.resolutionNote && <p className="mt-1.5 text-xs text-brand">{r.resolutionNote}</p>}
              </Cell>
              <Cell>
                <StatusPill tone={r.priority === "high" ? "danger" : r.priority === "low" ? "muted" : "warning"}>{t(`priorities.${r.priority}`)}</StatusPill>
              </Cell>
              <Cell>
                {r.source === "ai" ? (
                  <span className="flex items-center gap-1.5 text-sm text-link">
                    <Bot className="size-4" /> {t("sources.ai")}
                  </span>
                ) : (
                  <UserCell user={r.reporter} />
                )}
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
                      fields={[
                        { name: "action", label: t("whatToDo"), type: "select", required: true, defaultValue: "none", options: ACTIONS[r.targetType].map((value) => ({ value, label: t(`actions.${value}`) })) },
                        { name: "note", label: t("note"), type: "textarea", hint: t("noteHint") },
                      ]}
                    />
                    <ActionButton
                      label={t("dismiss")}
                      endpoint={`/admin/reports/${r.id}/resolve`}
                      body={{ decision: "dismissed" }}
                      fields={[{ name: "note", label: t("note"), type: "textarea", hint: t("noteHint") }]}
                    />
                    <ActionButton
                      label={t("setPriority")}
                      endpoint={`/admin/reports/${r.id}/priority`}
                      fields={[{ name: "priority", label: t("priority"), type: "select", required: true, defaultValue: r.priority, options: PRIORITIES.map((value) => ({ value, label: t(`priorities.${value}`) })) }]}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <StatusPill tone={toneFor(r.status)}>{t(`status.${r.status}`)}</StatusPill>
                    {r.actionTaken && r.actionTaken !== "none" && <span className="text-xs text-muted">{t(`actions.${r.actionTaken}`)}</span>}
                    {r.handledBy && <span className="text-xs text-muted">{r.handledBy.fullName}</span>}
                  </div>
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
