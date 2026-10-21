import { LifeBuoy, Plus } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import { pageParam, toQuery } from "@/lib/params";
import type { SupportTicket } from "@/modules/support";

/** Browser title of the support tickets list. */
export async function generateMetadata({ params }: PageProps<"/[locale]/support">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Support" });
  return { title: `${t("title")} | Mutamakin`, robots: { index: false } };
}

const TONES = { open: "warning", answered: "success", closed: "muted" } as const;

/** Support: the user's tickets and their status from GET /support, with links to the FAQ and to a new ticket. */
export default async function SupportPage({ params, searchParams }: PageProps<"/[locale]/support">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const [t, locale, result] = await Promise.all([
    getTranslations("Support"),
    getLocale(),
    apiGetOrNull<{ data: SupportTicket[]; meta: { current_page: number; last_page: number } }>(`/support${toQuery({ page: pageParam(query) })}`),
  ]);
  const tickets = result?.data ?? [];

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/faq" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold hover:border-brand">
            {t("faqLink")}
          </Link>
          <Link href="/support/new" className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-semibold text-white">
            <Plus className="size-4" /> {t("new")}
          </Link>
        </div>
      </header>

      {tickets.length ? (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link href={`/support/${ticket.id}`} className="flex flex-wrap items-center gap-3 p-4 hover:bg-surface-muted">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{ticket.subject}</span>
                  <span className="text-xs text-muted">
                    #{ticket.id} · {t(`categories.${ticket.category}`)} ·{" "}
                    {ticket.lastMessageAt ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(ticket.lastMessageAt)) : ""}
                  </span>
                </span>
                <StatusPill tone={TONES[ticket.status]}>{t(`statuses.${ticket.status}`)}</StatusPill>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <LifeBuoy className="size-10 text-brand" aria-hidden />
          <p className="font-semibold">{t("emptyTitle")}</p>
          <p className="max-w-md text-sm text-muted">{t("emptyText")}</p>
        </div>
      )}
      {result && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/support" />}
    </div>
  );
}
