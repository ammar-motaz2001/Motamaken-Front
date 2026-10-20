"use client";

import { Paperclip } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { SupportTicket } from "../types";

/**
 * The conversation of a support ticket. `side` decides which messages are drawn as "mine": the user's own messages on the
 * user's page, the staff's messages in the admin panel.
 */
export function TicketThread({ ticket, side }: { ticket: SupportTicket; side: "user" | "staff" }) {
  const t = useTranslations("Support");
  const locale = useLocale();
  const time = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  const size = (bytes: number) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

  return (
    <ol className="flex flex-col gap-4">
      {(ticket.messages ?? []).map((message) => {
        const mine = side === "staff" ? message.isStaff : !message.isStaff;
        const name = message.isStaff ? (message.author?.fullName ? t("staffName", { name: message.author.fullName }) : t("team")) : (message.author?.fullName ?? "");
        return (
          <li key={message.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
            {message.isStaff && !message.author ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">M</span>
            ) : (
              <UserAvatar name={message.author?.fullName ?? "?"} src={message.author?.avatarUrl ?? null} size={36} />
            )}
            <div className={`flex max-w-[85%] flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
              <span className="text-xs text-muted">
                {name} · {time(message.createdAt)}
              </span>
              <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${mine ? "bg-brand text-white" : "border border-border bg-surface-muted"}`}>
                {message.body}
                {message.attachment && (
                  <a
                    href={message.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${mine ? "bg-white/15" : "bg-surface"}`}
                  >
                    <Paperclip className="size-4 shrink-0" aria-hidden />
                    <span className="min-w-0 truncate">{message.attachment.name}</span>
                    <span className="shrink-0 opacity-70">{size(message.attachment.size)}</span>
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
