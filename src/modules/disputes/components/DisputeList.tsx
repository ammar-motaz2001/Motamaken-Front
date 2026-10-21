import { Scale } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { panelClasses } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import type { Dispute, Paginated } from "@/lib/api/types";
import { DISPUTE_TONE } from "../lib";

/** The user's disputes with project, milestone, amount and status, and paging. */
export async function DisputeList({ result }: { result: Paginated<Dispute> | null }) {
  const t = await getTranslations("Disputes");
  const format = await getFormatter();
  const rows = result?.data ?? [];

  return (
    <section className={`${panelClasses} flex flex-col gap-5`}>
      <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]} title={t("title")} subtitle={t("subtitle")} />
      {rows.length ? (
        <ul className="flex flex-col gap-3">
          {rows.map((dispute) => (
            <li key={dispute.id}>
              <Link href={`/disputes/${dispute.id}`} className="flex flex-col gap-2 rounded-xl border border-border p-4 transition-colors hover:border-brand">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-orange" dir="ltr">
                      {dispute.caseNumber}
                    </p>
                    <p className="font-bold">{dispute.project?.title}</p>
                    <p className="text-xs text-muted">
                      {dispute.milestone?.title} · {t(`reasons.${dispute.reason}`)}
                    </p>
                  </div>
                  <StatusPill tone={DISPUTE_TONE[dispute.status]}>{t(`statuses.${dispute.status}`)}</StatusPill>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted">
                  <span dir="ltr" className="font-bold text-foreground">
                    {dispute.milestone && dispute.currency ? format.number(dispute.milestone.amount, { style: "currency", currency: dispute.currency }) : ""}
                  </span>
                  <span>{t("openedOn", { date: format.dateTime(new Date(dispute.createdAt), { dateStyle: "medium" }), name: dispute.openedBy?.fullName ?? "" })}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
          <Scale className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
          <p className="max-w-sm">{t("empty")}</p>
        </div>
      )}
      {result && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/disputes" />}
    </section>
  );
}
