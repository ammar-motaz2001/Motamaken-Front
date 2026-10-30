"use client";

import { Paperclip, Send, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResultModal } from "@/components/ui/ResultModal";
import { StatusPill } from "@/components/ui/StatusPill";
import { panelClasses } from "@/components/ui/styles";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Dispute } from "@/lib/api/types";
import { DISPUTE_TONE } from "../lib";
import { AppealSection } from "./AppealSection";
import { Timeline } from "./Timeline";

const STEPS = ["open", "under_review", "resolved"] as const;

/**
 * Dispute case: details, timeline and a reply box with an attachment; parties can withdraw or concede,
 * and appeal a ruling.
 */
/** `projectHref` lets the admin panel open its own project page instead of the public one. */
export function DisputeCase({ dispute: initial, viewerId, projectHref }: { dispute: Dispute; viewerId: number; projectHref?: string }) {
  const t = useTranslations("Disputes");
  const format = useFormatter();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dispute, setDispute] = useState(initial);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState<"withdraw" | "concede" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const money = (value: number) => (dispute.currency ? format.number(value, { style: "currency", currency: dispute.currency }) : String(value));
  const step = dispute.status === "withdrawn" ? -1 : STEPS.indexOf(dispute.status as (typeof STEPS)[number]);

  const reload = async () => {
    const { data } = await api<{ data: Dispute }>(`/disputes/${dispute.id}`);
    setDispute(data);
    router.refresh();
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim() && !file) return;
    setSending(true);
    setError(null);
    try {
      const form = new FormData();
      if (body.trim()) form.append("body", body.trim());
      if (file) form.append("file", file);
      await api(`/disputes/${dispute.id}/messages`, { method: "POST", body: form });
      setBody("");
      setFile(null);
      await reload();
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(apiError.fields.file ?? apiError.fields.body ?? apiError.message ?? t("case.failed"));
    } finally {
      setSending(false);
    }
  };

  const act = async () => {
    if (!confirm) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: Dispute }>(`/disputes/${dispute.id}/${confirm}`, { method: "POST" });
      setDispute({ ...dispute, ...data });
      await reload();
    } catch (caught) {
      setError((caught as ApiError).message || t("case.failed"));
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className={`${panelClasses} flex flex-col gap-5`}>
        <PageHeader
          crumbs={[{ label: t("home"), href: "/" }, { label: t("title"), href: "/disputes" }, { label: dispute.caseNumber }]}
          title={t("case.title")}
          subtitle={dispute.project?.title}
          actions={<StatusPill tone={DISPUTE_TONE[dispute.status]}>{t(`statuses.${dispute.status}`)}</StatusPill>}
        />

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [t("case.number"), <span key="n" dir="ltr">{dispute.caseNumber}</span>],
            [t("case.amount"), <span key="a" dir="ltr" className="text-orange">{money(dispute.milestone?.amount ?? 0)}</span>],
            [t("case.openedBy"), dispute.openedBy?.fullName],
            [t("case.against"), dispute.against?.fullName],
          ].map(([label, value], index) => (
            <div key={index} className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        {step >= 0 && (
          <ol className="flex items-center gap-2" aria-label={t("case.progress")}>
            {STEPS.map((name, index) => (
              <li key={name} className="flex flex-1 items-center gap-2">
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index <= step ? "bg-brand text-white" : "bg-surface-muted text-muted"}`}>
                  <span className="trim-text">{index + 1}</span>
                </span>
                <span className={`text-xs ${index <= step ? "font-bold" : "text-muted"}`}>{t(`steps.${name}`)}</span>
                {index < STEPS.length - 1 && <span className={`h-0.5 flex-1 ${index < step ? "bg-brand" : "bg-border"}`} aria-hidden />}
              </li>
            ))}
          </ol>
        )}

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted">{t("case.milestone")}</p>
            <p className="font-medium">
              {dispute.milestone?.title} ·{" "}
              <Link href={projectHref ?? `/projects/${dispute.project?.id}`} className="text-brand hover:underline">
                {t("case.viewProject")}
              </Link>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("case.reason")}</p>
            <p className="font-medium">{t(`reasons.${dispute.reason}`)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted">{t("case.description")}</p>
            <p className="whitespace-pre-line">{dispute.description}</p>
          </div>
        </div>

        {dispute.resolution && (
          <div className="rounded-lg border border-brand/40 bg-brand-soft p-4 text-sm">
            <p className="font-bold text-brand">{t(`resolutions.${dispute.resolution}`, { percent: dispute.clientPercent ?? 0 })}</p>
            {dispute.resolutionNote && <p className="mt-1">{dispute.resolutionNote}</p>}
          </div>
        )}

        <AppealSection dispute={dispute} onDone={reload} />

        {(dispute.permissions.canWithdraw || dispute.permissions.canConcede) && (
          <div className="flex flex-wrap gap-3 border-t border-border pt-4">
            {dispute.permissions.canWithdraw && (
              <Button variant="outlineOrange" font="button" onClick={() => setConfirm("withdraw")}>
                {t("case.withdraw")}
              </Button>
            )}
            {dispute.permissions.canConcede && (
              <Button variant="outline" font="button" onClick={() => setConfirm("concede")}>
                {t("case.concede")}
              </Button>
            )}
          </div>
        )}
      </section>

      <section className={`${panelClasses} flex flex-col gap-4`}>
        <h2 className="text-lg font-bold">{t("case.timeline")}</h2>
        <Timeline entries={dispute.timeline ?? []} viewerId={viewerId} />

        {dispute.permissions.canPost ? (
          <form onSubmit={send} className="flex flex-col gap-2 border-t border-border pt-4">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              maxLength={3000}
              placeholder={t("case.placeholder")}
              aria-label={t("case.placeholder")}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-brand"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-1.5 text-muted hover:text-foreground">
                  <Paperclip className="size-4" />
                  {t("case.attach")}
                </button>
                {file && (
                  <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs">
                    {file.name}
                    <button type="button" aria-label={t("case.removeFile")} onClick={() => setFile(null)}>
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  className="sr-only"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </div>
              <Button type="submit" variant="solid" font="button" loading={sending} disabled={!body.trim() && !file}>
                <Send className="size-4" />
                {t("case.send")}
              </Button>
            </div>
            <p className="text-xs text-muted">{t("case.evidenceHint")}</p>
          </form>
        ) : (
          <p className="rounded-lg bg-surface-muted p-3 text-sm text-muted">{t("case.closed")}</p>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
      </section>

      <ResultModal open={Boolean(confirm)} onClose={() => setConfirm(null)} type="warning" message={confirm ? t(`case.${confirm}Confirm`) : ""}>
        <Button variant="outline" font="button" onClick={() => setConfirm(null)}>
          {t("case.keep")}
        </Button>
        <Button variant="orange" font="button" loading={busy} onClick={act}>
          {confirm ? t(`case.${confirm}`) : ""}
        </Button>
      </ResultModal>
    </div>
  );
}
