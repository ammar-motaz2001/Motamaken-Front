import { ShieldCheck } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import type { Escrow, Paginated } from "@/lib/api/types";

const TONE = { awaiting_funding: "warning", active: "success", completed: "muted" } as const;

export async function EscrowList({ result, viewerId }: { result: Paginated<Escrow> | null; viewerId: number | null }) {
  const t = await getTranslations("Escrow");
  const format = await getFormatter();
  const rows = result?.data ?? [];
  const money = (value: number, currency: string) => format.number(value, { style: "currency", currency });

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <header>
        <h2 className="text-lg font-bold">{t("overview.title")}</h2>
        <p className="text-sm text-muted">{t("overview.subtitle")}</p>
      </header>

      {rows.length ? (
        <ul className="flex flex-col gap-3">
          {rows.map((escrow) => {
            const { total, released, refunded, held } = escrow.totals;
            const progress = total ? Math.round(((released + refunded) / total) * 100) : 0;
            const paying = escrow.client?.id === viewerId;
            return (
              <li key={escrow.id}>
                <Link href={`/projects/${escrow.projectId}`} className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:border-brand">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{escrow.project?.title}</p>
                      <p className="text-xs text-muted">
                        {paying ? t("overview.youPay") : t("overview.youArePaid", { name: escrow.client?.fullName ?? "" })} ·{" "}
                        {t("overview.milestones", { count: escrow.milestones.length })}
                      </p>
                    </div>
                    <StatusPill tone={TONE[escrow.status]}>{t(`statuses.${escrow.status}`)}</StatusPill>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    {(
                      [
                        ["total", total],
                        ["held", held],
                        ["released", released],
                      ] as const
                    ).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs text-muted">{t(`summary.${key}`)}</dt>
                        <dd dir="ltr" className="text-start font-bold">
                          {money(value, escrow.currency)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                    <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
          <ShieldCheck className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
          <p className="max-w-sm">{t("overview.empty")}</p>
        </div>
      )}
      {result && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/settings/escrow" />}
    </section>
  );
}
