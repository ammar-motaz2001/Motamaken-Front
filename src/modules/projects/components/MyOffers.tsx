import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { outlinedPanelClasses, panelClasses } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import type { Paginated, Proposal } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { PROPOSAL_STATUS_TONE } from "../lib/status";
import { StatusTabs } from "./StatusTabs";
import { Money } from "@/components/providers/CurrencyProvider";

const STATUSES = ["", "pending", "accepted", "declined", "withdrawn"] as const;

/** The user's sent offers in status tabs, each with its project, amount and status, and paging. */
export function MyOffers({ result, status }: { result: Paginated<Proposal> | null; status: string }) {
  const t = useTranslations("Projects");
  const locale = useLocale();

  return (
    <section className={`${panelClasses} flex flex-col gap-5`}>
      <PageHeader
        crumbs={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("offers.title") }]}
        title={t("offers.title")}
        subtitle={t("offers.subtitle")}
      />
      <StatusTabs
        pathname="/offers"
        active={status}
        tabs={STATUSES.map((value) => ({ value, label: value ? t(`offer.status.${value}`) : t("mine.all") }))}
      />
      {!result && <p className="py-10 text-center text-muted">{t("list.failed")}</p>}
      {result?.data.length === 0 && <p className="py-10 text-center text-muted">{t("offers.empty")}</p>}
      <ul className="flex flex-col gap-3">
        {result?.data.map((proposal) => (
          <li key={proposal.id}>
            <Link
              href={`/projects/${proposal.projectId}`}
              className={`${outlinedPanelClasses} flex flex-wrap items-center gap-4 hover:border-brand`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate font-bold">{proposal.project?.title}</p>
                <p className="line-clamp-1 text-xs text-muted">{proposal.message}</p>
              </div>
              <span className="text-sm font-bold text-brand"><Money amount={proposal.amount} currency={proposal.currency} /></span>
              <span className="text-sm text-muted">{t("offer.deliveryIn", { count: proposal.deliveryDays })}</span>
              <span className="text-xs text-muted" suppressHydrationWarning>
                {timeAgo(proposal.createdAt, locale)}
              </span>
              <StatusPill tone={PROPOSAL_STATUS_TONE[proposal.status]}>{t(`offer.status.${proposal.status}`)}</StatusPill>
            </Link>
          </li>
        ))}
      </ul>
      {result && (
        <Pagination
          page={result.meta.current_page}
          lastPage={result.meta.last_page}
          pathname="/offers"
          query={{ status: status || undefined }}
        />
      )}
    </section>
  );
}
