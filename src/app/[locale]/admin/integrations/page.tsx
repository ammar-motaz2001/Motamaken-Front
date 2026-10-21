import { CheckCircle2, CircleOff, TriangleAlert, XCircle } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, dateTime, type IntegrationStatus, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

type LogRow = { id: number; service: string; level: string; message: string; context: Record<string, unknown> | null; createdAt: string };
type FailedJob = { id: number; uuid: string; job: string; queue: string; error: string; failedAt: string };

const ICONS = { ok: CheckCircle2, warning: TriangleAlert, error: XCircle, off: CircleOff } as const;
const COLORS = { ok: "text-brand", warning: "text-orange", error: "text-danger", off: "text-muted" } as const;

/** Admin › Integrations: status of each outside service, its call log and failed jobs to retry, from GET /admin/integrations. */
export default async function AdminIntegrations({ params, searchParams }: PageProps<"/[locale]/admin/integrations">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["service", "level"]);
  const [t, locale, status, logs, failed] = await Promise.all([
    getTranslations("Admin.integrations"),
    getLocale(),
    adminGet<{ data: IntegrationStatus[]; environment: string }>("/admin/integrations"),
    adminGet<List<LogRow>>(`/admin/integrations/logs${toQuery({ ...filter, page: pageParam(query) })}`),
    adminGet<{ data: FailedJob[] }>("/admin/integrations/failed-jobs"),
  ]);
  const show = (value: unknown) => (value === true ? t("yes") : value === false ? t("no") : value === null || value === undefined || value === "" ? "—" : String(value));

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle", { env: status.environment })} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {status.data.map((service) => {
          const Icon = ICONS[service.status];
          return (
            <section key={service.service} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{t(`services.${service.service}`)}</h3>
                <span className={`flex items-center gap-1 text-sm font-medium ${COLORS[service.status]}`}>
                  <Icon className="size-4" /> {t(`status.${service.status}`)}
                </span>
              </div>
              <dl className="flex flex-col gap-1 text-xs">
                {Object.entries(service.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-3">
                    <dt className="text-muted">{t.has(`details.${key}`) ? t(`details.${key}`) : key}</dt>
                    <dd className="truncate text-end" dir="ltr">
                      {key.toLowerCase().includes("at") || key.startsWith("last") ? (typeof value === "string" ? dateTime(value, locale) : show(value)) : show(value)}
                    </dd>
                  </div>
                ))}
              </dl>
              {t.has(`help.${service.service}`) && service.status !== "ok" && <p className="rounded-md bg-surface-muted px-2.5 py-2 text-xs text-muted">{t(`help.${service.service}`)}</p>}
              {service.service === "payments" && Array.isArray(service.details.availableModes) && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {(service.details.availableModes as string[])
                    .filter((mode) => mode !== service.details.mode)
                    .map((mode) => (
                      <ActionButton
                        key={mode}
                        label={t(`switchMode.${mode}`)}
                        tone={mode === "live" ? "orange" : "outline"}
                        method="PUT"
                        endpoint="/admin/integrations/payments/mode"
                        body={{ mode }}
                        confirm={t(`switchModeConfirm.${mode}`)}
                      />
                    ))}
                  {(service.details.availableModes as string[]).length < 2 && <p className="text-xs text-muted">{t("switchModeHint")}</p>}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <AdminSection
        title={t("failedJobs")}
        actions={failed.data.length > 0 && <ActionButton label={t("retryAll")} tone="brand" endpoint="/admin/integrations/failed-jobs/all/retry" confirm={t("confirmRetryAll")} />}
      >
        <AdminTable head={[t("job"), t("error"), t("when"), ""]} empty={failed.data.length ? false : t("noFailed")}>
          {failed.data.map((job) => (
            <tr key={job.uuid}>
              <Cell className="font-mono text-xs">{job.job}</Cell>
              <Cell className="max-w-md text-xs break-words text-danger">{job.error}</Cell>
              <Cell className="whitespace-nowrap">{dateTime(job.failedAt.replace(" ", "T") + "Z", locale)}</Cell>
              <Cell>
                <ActionButton label={t("retry")} endpoint={`/admin/integrations/failed-jobs/${job.uuid}/retry`} />
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>

      <AdminSection title={t("errors")}>
        <AdminSearch
          filters={[
            { name: "service", label: t("anyService"), options: ["payments", "mail", "recaptcha", "ai"].map((value) => ({ value, label: t(`services.${value}`) })) },
            { name: "level", label: t("anyLevel"), options: ["error", "warning", "info"].map((value) => ({ value, label: t(`levels.${value}`) })) },
          ]}
        />
        <AdminTable head={[t("service"), t("message"), t("when")]} empty={logs.data.length ? false : t("noErrors")}>
          {logs.data.map((row) => (
            <tr key={row.id}>
              <Cell>
                <StatusPill tone={row.level === "error" ? "danger" : row.level === "warning" ? "warning" : "muted"}>{t(`services.${row.service}`)}</StatusPill>
              </Cell>
              <Cell className="max-w-lg text-sm break-words">
                {row.message}
                {row.context && <div className="mt-1 font-mono text-xs text-muted">{JSON.stringify(row.context)}</div>}
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(row.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={logs.meta.current_page} lastPage={logs.meta.last_page} pathname="/admin/integrations" query={filter} />
      </AdminSection>
    </>
  );
}
