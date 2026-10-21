import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSection, StatusTabs, UserCell, dateTime, money, toneFor, type AdminAppeal, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const STATUSES = ["pending", "upheld", "overturned"] as const;

/** Admin › Appeals: requests to reopen a dispute ruling, by status, to decide, from GET /admin/appeals. */
export default async function AdminAppeals({ params, searchParams }: PageProps<"/[locale]/admin/appeals">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const status = pickParams(query, ["status"]).status ?? "pending";
  const [t, td, locale, result] = await Promise.all([
    getTranslations("Admin.appeals"),
    getTranslations("Admin.disputes"),
    getLocale(),
    adminGet<List<AdminAppeal> & { counts: Record<string, number> }>(`/admin/appeals${toQuery({ status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs pathname="/admin/appeals" current={status} tabs={STATUSES.map((value) => ({ value, label: t(`statuses.${value}`), count: result.counts[value] ?? 0 }))} />
        {result.data.length === 0 && <p className="py-10 text-center text-sm text-muted">{t("empty")}</p>}
        <ul className="flex flex-col gap-4">
          {result.data.map((appeal) => {
            const d = appeal.dispute;
            return (
              <li key={appeal.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    {d && (
                      <Link href={`/admin/disputes/${d.id}`} className="font-bold hover:text-brand">
                        {d.caseNumber} · {d.project?.title}
                      </Link>
                    )}
                    <span className="text-xs text-muted">
                      {d?.milestone?.title} · {d?.milestone && d.currency ? money(d.milestone.amount, d.currency, locale) : ""} · {t("settledOn", { date: dateTime(d?.resolvedAt ?? null, locale) })}
                    </span>
                  </div>
                  <StatusPill tone={toneFor(appeal.status)}>{t(`statuses.${appeal.status}`)}</StatusPill>
                </div>
                {d && (
                  <div className="rounded-lg bg-surface-muted p-3 text-sm">
                    <p className="text-xs font-semibold text-muted uppercase">{t("firstDecision")}</p>
                    <p className="font-medium">
                      {td(`resolutions.${d.resolution}`)}
                      {d.resolution === "split" && d.clientPercent !== null ? ` (${d.clientPercent}%)` : ""}
                    </p>
                    {d.resolutionNote && <p className="text-muted">{d.resolutionNote}</p>}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <UserCell user={appeal.user} /> · {dateTime(appeal.createdAt, locale)}
                  </div>
                  <p className="text-sm whitespace-pre-line">{appeal.reason}</p>
                </div>
                {appeal.status === "pending" ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/admin/disputes/${d?.id}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
                      {t("evidence")}
                    </Link>
                    <ActionButton
                      label={t("uphold")}
                      endpoint={`/admin/appeals/${appeal.id}/decide`}
                      body={{ decision: "upheld" }}
                      description={t("upholdHint")}
                      fields={[{ name: "note", label: t("note"), type: "textarea", required: true, hint: t("noteHint") }]}
                    />
                    <ActionButton
                      label={t("overturn")}
                      tone="orange"
                      endpoint={`/admin/appeals/${appeal.id}/decide`}
                      body={{ decision: "overturned" }}
                      description={t("overturnHint", { max: d?.milestone && d.currency ? money(d.milestone.amount, d.currency, locale) : "" })}
                      fields={[
                        { name: "amount", label: t("amount"), type: "number", step: "0.01", required: true, hint: t("amountHint") },
                        { name: "to", label: t("to"), type: "select", required: true, options: [{ value: "client", label: t("toClient") }, { value: "freelancer", label: t("toFreelancer") }] },
                        { name: "note", label: t("note"), type: "textarea", required: true, hint: t("noteHint") },
                      ]}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border-s-4 border-brand bg-brand/5 px-3 py-2 text-sm">
                    <p>{appeal.decisionNote}</p>
                    {appeal.adjustment !== null && d?.currency && (
                      <p className="text-brand">{t(appeal.adjustmentTo === "freelancer" ? "movedToFreelancer" : "movedToClient", { amount: money(appeal.adjustment, d.currency, locale) })}</p>
                    )}
                    <p className="text-xs text-muted">
                      {appeal.decidedBy?.fullName} · {dateTime(appeal.decidedAt, locale)}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/appeals" query={{ status }} />
      </AdminSection>
    </>
  );
}
