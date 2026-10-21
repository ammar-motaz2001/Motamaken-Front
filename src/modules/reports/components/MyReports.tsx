import { FileWarning } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import type { ContentReport, Paginated } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";

const TONE = { open: "warning", actioned: "success", dismissed: "muted" } as const;

type Result = Paginated<ContentReport> & { counts: Partial<Record<ContentReport["status"], number>> };

/** The user's reports with counts by status, what was reported (linked when possible) and the outcome. */
export async function MyReports({ result }: { result: Result | null }) {
  const t = await getTranslations("Reports");
  const format = await getFormatter();
  const rows = result?.data ?? [];
  const href = (report: ContentReport) =>
    report.targetType === "user" ? `/users/${report.targetId}` : report.targetType === "project" ? `/projects/${report.targetId}` : null;

  return (
    <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
      <dl className="grid grid-cols-3 gap-3">
        {(["open", "actioned", "dismissed"] as const).map((status) => (
          <div key={status} className={`rounded-xl p-3 text-center ${status === "open" ? "bg-orange text-white" : "bg-orange/10"}`}>
            <dd className="text-xl font-bold">{result?.counts[status] ?? 0}</dd>
            <dt className="text-xs">{t(`statuses.${status}`)}</dt>
          </div>
        ))}
      </dl>
      {rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-surface-muted text-xs text-muted">
              <tr>
                <th className="px-3 py-2.5 text-start font-medium">{t("date")}</th>
                <th className="px-3 py-2.5 text-start font-medium">{t("content")}</th>
                <th className="px-3 py-2.5 text-start font-medium">{t("reason")}</th>
                <th className="px-3 py-2.5 text-start font-medium">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((report) => {
                const link = href(report);
                return (
                  <tr key={report.id} className="border-t border-border align-top">
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted">{format.dateTime(new Date(report.createdAt), { dateStyle: "medium" })}</td>
                    <td className="px-3 py-2.5">
                      {link ? (
                        <Link href={link} className="text-brand hover:underline">
                          {t(`targets.${report.targetType}`)}
                        </Link>
                      ) : (
                        t(`targets.${report.targetType}`)
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {t(`modal.reasons.${report.reason}`)}
                      {report.resolutionNote && <p className="mt-1 text-xs text-muted">{report.resolutionNote}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill tone={TONE[report.status]}>{t(`statuses.${report.status}`)}</StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
          <FileWarning className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
          <p>{t("empty")}</p>
        </div>
      )}
      {result && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/settings/reports" />}
    </SettingsPanel>
  );
}
