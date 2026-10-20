"use client";

import { Gavel, Paperclip, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Dispute } from "@/lib/api/types";

const TONE = { pending: "warning", upheld: "muted", overturned: "success" } as const;

/** After a dispute is settled: the appeals filed so far and, while allowed, the form to ask for a second look. */
export function AppealSection({ dispute, onDone }: { dispute: Dispute; onDone: () => Promise<void> }) {
  const t = useTranslations("Disputes.appeal");
  const format = useFormatter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appeals = dispute.appeals ?? [];

  if (!appeals.length && !dispute.permissions.canAppeal) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("reason", reason.trim());
      if (file) form.append("file", file);
      await api(`/disputes/${dispute.id}/appeal`, { method: "POST", body: form });
      setOpen(false);
      setReason("");
      setFile(null);
      await onDone();
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(apiError.fields.reason ?? apiError.fields.file ?? apiError.message ?? t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      {appeals.map((appeal) => (
        <div key={appeal.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Gavel className="size-4 text-orange" aria-hidden />
              {t("by", { name: appeal.user?.fullName ?? "" })}
            </span>
            <StatusPill tone={TONE[appeal.status]}>{t(`statuses.${appeal.status}`)}</StatusPill>
          </div>
          <p className="whitespace-pre-line text-muted">{appeal.reason}</p>
          {appeal.decisionNote && <p className="rounded-md bg-surface-muted px-3 py-2">{appeal.decisionNote}</p>}
          {appeal.adjustment && dispute.currency && (
            <p className="text-brand">{t(`adjusted.${appeal.adjustmentTo ?? "client"}`, { amount: format.number(appeal.adjustment, { style: "currency", currency: dispute.currency }) })}</p>
          )}
        </div>
      ))}

      {dispute.permissions.canAppeal &&
        (open ? (
          <form onSubmit={submit} className="flex flex-col gap-2 rounded-lg border border-orange/40 bg-orange/5 p-4">
            <p className="font-semibold">{t("title")}</p>
            <p className="text-xs text-muted">{t("hint")}</p>
            <textarea
              required
              minLength={20}
              maxLength={3000}
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("title")}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-brand"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-1.5 text-muted hover:text-foreground">
                  <Paperclip className="size-4" />
                  {t("evidence")}
                </button>
                {file && (
                  <span className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs">
                    {file.name}
                    <button type="button" aria-label={t("removeFile")} onClick={() => setFile(null)}>
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <input ref={fileInput} type="file" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" font="button" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" variant="solid" font="button" loading={busy}>
                  {t("send")}
                </Button>
              </div>
            </div>
            {error && (
              <p role="alert" className="text-xs text-danger">
                {error}
              </p>
            )}
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-muted p-3 text-sm">
            <span className="text-muted">{t("invite")}</span>
            <Button variant="outlineOrange" font="button" onClick={() => setOpen(true)}>
              {t("open")}
            </Button>
          </div>
        ))}
    </div>
  );
}
