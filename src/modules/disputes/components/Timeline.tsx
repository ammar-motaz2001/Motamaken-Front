"use client";

import { Paperclip } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { DisputeEntry } from "@/lib/api/types";

export function Timeline({ entries, viewerId }: { entries: DisputeEntry[]; viewerId: number }) {
  const t = useTranslations("Disputes.case");
  const format = useFormatter();

  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry) =>
        entry.kind === "system" ? (
          <li key={entry.id} className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span>
              {entry.body} · {format.dateTime(new Date(entry.createdAt), { dateStyle: "medium", timeStyle: "short" })}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </li>
        ) : (
          <li key={entry.id} className={`flex gap-3 ${entry.author?.id === viewerId ? "flex-row-reverse text-end" : ""}`}>
            <UserAvatar name={entry.author?.fullName ?? "?"} src={entry.author?.avatarUrl ?? null} size={36} />
            <div
              className={`flex max-w-[80%] flex-col gap-1 rounded-xl p-3 text-sm ${
                entry.kind === "appeal"
                  ? "border border-orange/40 bg-orange/5"
                  : entry.author?.isAdmin
                    ? "border border-link/40 bg-link/10"
                    : entry.author?.id === viewerId
                      ? "bg-brand-soft"
                      : "bg-surface-muted"
              }`}
            >
              <span className="text-xs font-bold">
                {entry.author?.fullName}
                {entry.author?.isAdmin && <span className="ms-1.5 text-link">{t("admin")}</span>}
                {entry.kind === "appeal" && <span className="ms-1.5 text-orange">{t("appeal")}</span>}
              </span>
              {entry.body && <p className="text-start whitespace-pre-line">{entry.body}</p>}
              {entry.attachment &&
                (entry.attachment.mime.startsWith("image/") ? (
                  <a href={entry.attachment.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.attachment.url} alt={entry.attachment.name} className="max-h-48 rounded-lg" />
                  </a>
                ) : (
                  <a href={entry.attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-link underline">
                    <Paperclip className="size-4" />
                    {entry.attachment.name}
                  </a>
                ))}
              <span className="text-[11px] text-muted">{format.dateTime(new Date(entry.createdAt), { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
          </li>
        ),
      )}
    </ol>
  );
}
