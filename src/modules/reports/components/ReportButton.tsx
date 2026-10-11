"use client";

import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { TextArea } from "@/components/ui/TextArea";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { ReportTarget } from "@/lib/api/types";

const REASONS = ["spam", "fake", "inappropriate", "copyright", "scam", "other"] as const;

type ReportButtonProps = { targetType: ReportTarget; targetId: number; signedIn: boolean; className?: string; label?: string };

export function ReportButton({ targetType, targetId, signedIn, className = "", label }: ReportButtonProps) {
  const t = useTranslations("Reports.modal");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"sent" | "already" | null>(null);

  const close = () => (setOpen(false), setReason(""), setDetails(""), setError(null));

  const submit = async () => {
    if (!reason) return setError(t("reasonRequired"));
    if (reason === "other" && details.trim().length < 10) return setError(t("detailsRequired"));
    setBusy(true);
    setError(null);
    try {
      await api("/reports", { method: "POST", body: { targetType, targetId, reason, details: details.trim() || null } });
      close();
      setDone("sent");
    } catch (caught) {
      const apiError = caught as ApiError;
      if (apiError.code === "already_reported") {
        close();
        setDone("already");
      } else {
        setError(apiError.fields.details ?? apiError.message ?? t("failed"));
      }
    } finally {
      setBusy(false);
    }
  };

  const trigger = (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:underline ${className}`}>
      <Flag className="size-3.5" />
      {label ?? t("trigger")}
    </span>
  );

  if (!signedIn) return <Link href="/login">{trigger}</Link>;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {trigger}
      </button>
      <Modal
        open={open}
        onClose={close}
        showClose
        title={
          <span className="flex flex-col gap-1 text-start">
            {t("title")}
            <span className="text-sm font-normal text-muted">{t("subtitle")}</span>
          </span>
        }
      >
        <div className="flex w-full flex-col gap-4 text-start">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">{t("reason")}</legend>
            {REASONS.map((value) => (
              <label key={value} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm ${reason === value ? "border-brand bg-brand-soft" : "border-border"}`}>
                <input type="radio" name="reason" checked={reason === value} onChange={() => (setReason(value), setError(null))} className="accent-brand" />
                {t(`reasons.${value}`)}
              </label>
            ))}
          </fieldset>
          <TextArea label={t("details")} placeholder={t("detailsPlaceholder")} rows={3} maxLength={2000} value={details} onChange={(event) => (setDetails(event.target.value), setError(null))} />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button variant="solid" font="button" loading={busy} onClick={submit} className="self-center">
            {t("submit")}
          </Button>
        </div>
      </Modal>
      <ResultModal open={Boolean(done)} onClose={() => setDone(null)} type="success" message={t(done === "already" ? "already" : "sent")}>
        <Button variant="outline" font="button" href="/settings/reports">
          {t("myReports")}
        </Button>
        <Button variant="solid" font="button" onClick={() => setDone(null)}>
          {t("close")}
        </Button>
      </ResultModal>
    </>
  );
}
