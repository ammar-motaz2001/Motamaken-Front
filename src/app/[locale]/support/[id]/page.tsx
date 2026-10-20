import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import type { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import { CloseTicketButton, ReplyBox, TicketThread, type SupportTicket } from "@/modules/support";

const TONES = { open: "warning", answered: "success", closed: "muted" } as const;

export default async function SupportTicketPage({ params }: PageProps<"/[locale]/support/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d+$/.test(id)) notFound();
  const [t, { data: ticket }] = await Promise.all([
    getTranslations("Support"),
    apiGet<{ data: SupportTicket }>(`/support/${id}`).catch((error: ApiError) => {
      if (error.status === 404) notFound();
      throw error;
    }),
  ]);

  return (
    <div className="page-container flex max-w-3xl flex-col gap-6 py-10">
      <div>
        <Link href="/support" className="text-sm text-link hover:underline">
          {t("back")}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <div className="flex items-center gap-2">
            <StatusPill tone={TONES[ticket.status]}>{t(`statuses.${ticket.status}`)}</StatusPill>
            {ticket.status !== "closed" && <CloseTicketButton ticketId={ticket.id} />}
          </div>
        </div>
        <p className="text-sm text-muted">
          #{ticket.id} · {t(`categories.${ticket.category}`)}
        </p>
      </div>
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
        <TicketThread ticket={ticket} side="user" />
        {ticket.status === "closed" ? (
          <p className="rounded-lg bg-surface-muted px-4 py-3 text-center text-sm text-muted">
            {t("closedNote")}{" "}
            <Link href="/support/new" className="text-link hover:underline">
              {t("new")}
            </Link>
          </p>
        ) : (
          <ReplyBox endpoint={`/support/${ticket.id}/reply`} />
        )}
      </div>
    </div>
  );
}
